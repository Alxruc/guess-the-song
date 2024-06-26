import React from "react";
import { useState, useEffect } from "react";
import { ScoreView } from "./scoreview";
import "./styling/gtsgame.css";
const socket = require("../connection/socket").socket;

const winningScore = 5;


const Timer = ({ seconds, setStarted }) => {
  // initialize timeLeft with the seconds prop
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(
    () => {
      // exit early when we reach 0
      if (!timeLeft) {
        setStarted(true);
        return;
      }
      // save intervalId to clear the interval when the
      // component re-renders
      const intervalId = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      // clear interval on re-render to avoid memory leaks
      return () => clearInterval(intervalId);
      // add timeLeft as a dependency to re-rerun the effect
      // when we update it
    },
    [timeLeft, setStarted]
  );

  return (
    <div>
      <h1> Game starts in: </h1>
      <h2>{timeLeft}</h2>
    </div>
  );
};

class GTSGame extends React.Component {

  componentDidMount() {
    if (this.props.user.host) {
      this.props.play(this.props.song.uri);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.songPlaying !== this.props.songPlaying && this.props.user.host) {
      if (this.props.songPlaying) {
        this.props.resumePlayer();
      } else {
        this.props.pausePlayer();
      }
    }
  }

  handleGuessClick = () => {
    console.log("New guess");
    socket.emit("new guess", {
      gameId: this.props.gameid,
      username: this.props.user.username,
    });
    this.props.setSongPlaying(false);
  };

  handleCorrectGuess = () => {
    console.log("Correct guess");
    socket.emit("correct guess", {
      gameId: this.props.gameid,
      username: this.props.guessingPlayer,
    });
    this.props.setScores({
      ...this.props.scores,
      [this.props.guessingPlayer]:
        this.props.scores[this.props.guessingPlayer] + 1,
    });
    if(this.props.scores[this.props.guessingPlayer] === winningScore) {
      this.props.setWinner(this.props.guessingPlayer);
    }
    this.props.toggleComponentVisibility();
  };

  handleWrongGuess = () => {
    console.log("Wrong guess");
    socket.emit("wrong guess", {
      gameId: this.props.gameid,
      username: this.props.guessingPlayer,
    });
  };

  handleSkip = () => {
    console.log("Skip");
    socket.emit("skip", {
      gameId: this.props.gameid,
    });
    this.props.setSongPlaying(false);
    this.props.pausePlayer();
    this.props.toggleComponentVisibility();
  }

  render() {
    return (
      <React.Fragment>
        <ScoreView scores={this.props.scores} guessingPlayer={this.props.guessingPlayer}/>
        {this.props.user.host ? (
          <div>
            <h1>
              You've selected {this.props.song.name} by {this.props.song.artists.map(artist => artist.name).join(", ")}! Waiting for other players
              to guess...
            </h1>
            {!this.props.songPlaying && (
              <div>
                <button class="btn btn-danger" onClick={this.handleWrongGuess}>
                  Wrong!
                </button>
                <button
                  class="btn btn-success"
                  onClick={this.handleCorrectGuess}
                >
                  Correct!
                </button>
              </div>
            )}
            <div>
              <button class="btn btn-secondary" onClick={this.handleSkip}>
                Skip
              </button>
            </div>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            <h1> What is the name of this song?</h1>
            {this.props.songPlaying && ( 
            this.props.canGuess ? (
              <button class="buzzer"  onClick={this.handleGuessClick}>
                GUESS!
              </button>
            ) : (
              <button class="buzzer-greyed">
                Already guessed this round
              </button>
            ))}
          </div>
        )}
      </React.Fragment>
    );
  }
}

const GTSWrapper = (props) => {
  const [started, setStarted] = useState(false);
  const [songPlaying, setSongPlaying] = useState(true);
  const [canGuess, setCanGuess] = useState(true);

  useEffect(() => {
    socket.on("player guessed", (data) => {
      console.log("Player guessed: " + data.username);
      setSongPlaying(false);
      props.setGuessingPlayer(data.username);
    });
  });

  useEffect(() => {
    socket.on("player correct", (player) => {
      props.setScores({
        ...props.scores,
        [player.userName]: player.score,
      });
      if (player.score === winningScore) {
        props.setWinner(player.userName);
      }
      setCanGuess(true);
      props.toggleComponentVisibility();
      props.setGuessingPlayer("");
      setSongPlaying(false);
    });
  });

  useEffect(() => {
    socket.on("player wrong", (data) => {
      if (data.username === props.user.username) {
        // if the player guessed wrong, they can't guess again until the next song
        setCanGuess(false);
      }
      if(data.roundOver) {
        setCanGuess(true);
        props.toggleComponentVisibility();
      }
      props.setGuessingPlayer("");
      setSongPlaying(true); 
    });
  });

  useEffect(() => {
    socket.on("song skip", () => {
      setCanGuess(true);
      props.toggleComponentVisibility();
      props.setGuessingPlayer("");
      setSongPlaying(false);
    }
  )});

  useEffect(() => {
    // Only initialize scores if they haven't been initialized yet
    if (Object.keys(props.scores).length === 0) {
      let initialScores = {};

      // The host doesn't play, so they don't need a score
      if(!props.host) {
        initialScores = {
          [props.user.username]: 0,
        };
      }
      props.opponentUserNames?.forEach((username) => {
        initialScores[username] = 0;
      });
      props.setScores(initialScores);
    }
  });

  return (
    <div>
      {started ? (
        <GTSGame
          {...props}
          songPlaying={songPlaying}
          setSongPlaying={setSongPlaying}
          canGuess={canGuess}
        />
      ) : (
        <Timer seconds={3} setStarted={setStarted} />
      )}
    </div>
  );
};

export default GTSWrapper;
