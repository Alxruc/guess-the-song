import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FixedSizeList as List } from "react-window";
import GTSGame from "./gtsgame";
import "./styling/songselectorstyle.css";

const socket = require("../connection/socket").socket;

const Row = ({ index, style, onRowClick, song }) => (
  <div
    className={index % 2 ? "ListItemOdd" : "ListItemEven"}
    style={style}
    onClick={() => onRowClick(index)}
  >
    {song
      ? song.name + " - " + song.artists.map((artist) => artist.name).join(", ")
      : "-"}
  </div>
);

function copyURL()  {
  navigator.clipboard.writeText(window.location.href);
}

class GTSGameSelector extends React.Component {
  state = {
    points: 0,
    host: false,
    username: "",
    song: null,
    isListVisible: false,
    songList: null,
    isOtherComponentVisible: false,
  };

  constructor(props) {
    super(props);
    this.userInput = React.createRef();
    this.audio = React.createRef();
  }

  componentDidMount() {
    this.setState({ username: this.props.username });
    this.setState({ host: this.props.host });

    socket.on("song selected", (data) => {
      console.log("New song received");
      console.log(data);
      this.setState({
        song: data.song,
        isOtherComponentVisible: true,
      });
    });
  }

  handleRowClick = (index) => {
    this.setState({
      song: this.state.songList[index],
    });
  };

  handleSearch = async () => {
    const userInput = this.userInput.current.value;
    if (userInput.match(/^\s*$/)) {
      alert("Please enter a song!");
    } else {
      console.log("Searching for " + userInput);

      var trackParams = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.props.accessToken,
        },
      };

      await fetch(
        "https://api.spotify.com/v1/search?q=" + userInput + "&type=track",
        trackParams
      )
        .then((response) => response.json())
        .then((data) => {
          this.setState({
            songList: data.tracks.items,
          });
          console.log(data.tracks.items);
        });

      this.setState({ isListVisible: true });
    }
  };

  playAudio = () => {
    console.log(this.audio.current.src);
    this.audio.current.play();
  };

  pauseAudio = () => {
    this.audio.current.pause();
  };

  toggleComponentVisibility = () => {
    this.setState((prevState) => ({
      isOtherComponentVisible: !prevState.isOtherComponentVisible,
    }));
  };

  handleSubmit = () => {
    if (this.state.song && this.state.song.preview_url !== undefined) {
      this.setState({
        isOtherComponentVisible: true,
      });
      const idData = {
        gameId: this.props.gameid,
        userName: this.props.username,
        song: this.state.song,
      };
      socket.emit("new song", idData);
    } else {
      alert("Please select a song!");
    }
  };

  render() {
    return (
      <React.Fragment>
        {this.state.isOtherComponentVisible ? (
          <GTSGame
            {...this.state}
            {...this.props}
            toggleComponentVisibility={this.toggleComponentVisibility}
          />
        ) : this.state.host ? (
          <div>
            <h1> Search for a song! </h1>
            <div>
              {this.state.song && (
                <button className="btn btn-primary" onClick={this.handleSubmit}>
                  Submit
                </button>
              )}
            </div>
            <div>
              <audio
                ref={this.audio}
                src={this.state.song ? this.state.song.preview_url : ""}
                onLoadedMetadata={() => {
                  if (this.audio.current) this.audio.current.volume = 0.05;
                }}
              ></audio>

              {this.state.song && this.state.song.preview_url && (
                <button className="btn btn-primary" onClick={this.playAudio}>
                  Play
                </button>
              )}
              <input ref={this.userInput}></input>
              {this.state.song && this.state.song.preview_url && (
                <button className="btn btn-primary" onClick={this.pauseAudio}>
                  Pause
                </button>
              )}
            </div>
            <div>
              {this.state.isListVisible && (
                <List
                  className="List"
                  height={150}
                  itemCount={20}
                  itemSize={50}
                  width={300}
                >
                  {({ index, style }) => (
                    <Row
                      index={index}
                      style={style}
                      onRowClick={this.handleRowClick}
                      song={
                        this.state.songList ? this.state.songList[index] : null
                      }
                    />
                  )}
                </List>
              )}
            </div>
            <div>
              <button className="btn btn-primary" onClick={this.handleSearch}>
                Search
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h1>Waiting for the host to select a song...</h1>
          </div>
        )}
      </React.Fragment>
    );
  }
}

const SelectorWrapper = (props) => {
  const { gameid } = useParams();

  const [accessToken, setAccessToken] = useState("");
  const [opponentSocketIDs, setOpponentSocketIDs] = useState([]);
  const [opponentUserNames, setOpponentUserNames] = useState([]);
  const [didStart, setDidStart] = useState(false);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    console.log("Fetching Spotify token");
    fetch("http://localhost:8000/spotify-token")
      .then((response) => response.json())
      .then((data) => {
        setAccessToken(data.access_token);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  useEffect(() => {
    socket.on("opponent joined", (data) => {
      console.log("Opponents joined");
      console.log(data);
      const userNames = data
        .filter((player) => player.socketId !== socket.id)
        .map((player) => player.userName);
      const socketIDs = data
        .filter((player) => player.socketId !== socket.id)
        .map((player) => player.socketId);
      setOpponentUserNames(userNames);
      setOpponentSocketIDs(socketIDs);
    });
  });

  useEffect(() => {
    socket.on("game started", (idData) => {
      setDidStart(true);
    });
  }, []);

  return (
    <div>
      {didStart ? (
        <GTSGameSelector
          accessToken={accessToken}
          host={props.isHost}
          username={props.myUserName}
          gameid={gameid}
          opponentUserNames={opponentUserNames}
          scores={scores}
          setScores={setScores}
        />
      ) : (
        <React.Fragment>
          <div>
            {props.isHost ? (
              <div>
                <h1 class="copyEffect" onClick={copyURL}>
                  Share the game link with others!
                </h1>
                <br></br>
                <h2>
                  Current players:{" "}
                  {opponentUserNames &&
                    opponentUserNames.length > 1 &&
                    opponentUserNames.join(", ")}
                </h2>
              </div>
            ) : (
              <h2>
                Current opponents:{" "}
                {opponentUserNames &&
                  opponentUserNames.length > 1 &&
                  opponentUserNames.join(", ")}
              </h2>
            )}
          </div>
          <div>
            {props.isHost &&
              opponentSocketIDs &&
              opponentSocketIDs.length > 1 && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const idData = {
                      gameId: gameid,
                      userName: props.myUserName,
                    };
                    setDidStart(true);
                    socket.emit("start game", idData);
                  }}
                >
                  Start Game
                </button>
              )}
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default SelectorWrapper;
