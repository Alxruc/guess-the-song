import React from "react";
import { useState, useEffect } from "react";
import "./styling/gtsgame.css";
const socket = require("../connection/socket").socket;


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
  constructor(props) {
    super(props);
    this.audio = React.createRef();
  }

  componentDidMount() {
    this.audio.current.volume = 0.05;
    this.audio.current.play();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.songPlaying !== this.props.songPlaying) {
      if (this.props.songPlaying) {
        this.audio.current.play();
      } else {
        this.audio.current.pause();
      }
    }
  }

  handleGuessClick = () => {
    console.log("New guess");
    socket.emit("new guess", {
      gameId: this.props.gameid,
      username: this.props.username,
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
    this.props.toggleComponentVisibility();
  };

  handleWrongGuess = () => {
    console.log("Wrong guess");
    socket.emit("wrong guess", {
      gameId: this.props.gameid,
      username: this.props.guessingPlayer,
    });
    this.props.setSongPlaying(true);
  };

  render() {
    return (
      <React.Fragment>
        <div>
          <h3>Scores:</h3>
          {Object.entries(this.props.scores).map(([username, score]) => (
            <p key={username}>
              {username}: {score}
            </p>
          ))}
        </div>
        <audio
          ref={this.audio}
          src={this.props.song ? this.props.song.preview_url : ""}
        ></audio>
        {this.props.host ? (
          <div>
            <h1>
              You've selected {this.props.song.name}! Waiting for other players
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
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            <h1> What is the name of this song?</h1>
            {this.props.songPlaying && (
              <button class="buzzer" onClick={this.handleGuessClick}>
                GUESS!
              </button>
            )}
          </div>
        )}
      </React.Fragment>
    );
  }
}

const GTSWrapper = (props) => {
  const [started, setStarted] = useState(false);
  const [songPlaying, setSongPlaying] = useState(true);
  const [guessingPlayer, setGuessingPlayer] = useState("");

  useEffect(() => {
    socket.on("player guessed", (data) => {
      console.log("Player guessed: " + data.username);
      setSongPlaying(false);
      setGuessingPlayer(data.username);
    });
  });

  useEffect(() => {
    socket.on("player correct", (player) => {
      props.setScores({
        ...props.scores,
        [player.userName]: player.score,
      });
      props.toggleComponentVisibility();
      setGuessingPlayer("");
      setSongPlaying(true);
    });
  });

  useEffect(() => {
    socket.on("player wrong", (data) => {
      setSongPlaying(true);
      setGuessingPlayer("");
    });
  });

  useEffect(() => {
    // Only initialize scores if they haven't been initialized yet
    if (Object.keys(props.scores).length === 0) {
      const initialScores = { [props.username]: 0 };
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
          scores={props.scores}
          setScores={props.setScores}
          guessingPlayer={guessingPlayer}
        />
      ) : (
        <Timer seconds={3} setStarted={setStarted} />
      )}
    </div>
  );
};

export default GTSWrapper;
