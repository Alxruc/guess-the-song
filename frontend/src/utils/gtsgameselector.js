import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FixedSizeList as List } from "react-window";
import NewWindow from 'react-new-window';
import GTSGame from "./gtsgame";
import ScoreView from "./scoreview";
import "./styling/songselectorstyle.css";
import { BACKEND_URL } from "../config";
import setupWebPlayer from "./webplayer";

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

const SubmitButton = ({ handleSubmit, song }) => song && (
  <button
    className="hoverButton tealHover"
    onClick={handleSubmit}
  >
    Submit
  </button>
);

const SearchButton = ({ handleSearch, searchType }) => (
  <button
    className="hoverButton tealHover"
    onClick={handleSearch}
  >
    Search {searchType === "playlist" ? "for playlists" : "for specific songs"}
  </button>
);

const SongList = ({ isListVisible, songList, handleRowClick }) => isListVisible && (
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
        onRowClick={handleRowClick}
        song={songList ? songList[index] : null}
      />
    )}
  </List>
);

function copyURL() {
  navigator.clipboard.writeText(window.location.href);
}

class GTSGameSelector extends React.Component {
  state = {
    points: 0,
    host: false,
    username: "",
    song: null,
    searchType: "playlist",
    isListVisible: false,
    songList: null,
    isOtherComponentVisible: false,
  };

  constructor(props) {
    super(props);
    this.userInput = React.createRef();
  }

  componentDidMount() {
    this.setState({ username: this.props.user.username });
    this.setState({ host: this.props.user.host });

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

  handleTrackSearch = async () => {
    const userInput = this.userInput.current.value;
    if (userInput.match(/^\s*$/)) {
      alert("Please enter a song!");
    } else {
      console.log("Searching for " + userInput);

      var trackParams = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.props.user.accessToken,
        },
      };

      await fetch(
        "https://api.spotify.com/v1/search?q=" + userInput + "&type=track&market=DE",
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

  handlePlaylistSearch = async () => {
    const userInput = this.userInput.current.value;
    const regex1 = /^spotify:playlist:(\w+)$/;
    const regex2 = /^https:\/\/open\.spotify\.com\/playlist\/(\w+)(\?.*)?$/;

    console.log(regex1.test(userInput));
    console.log(regex2.test(userInput));
    if (userInput.match(/^\s*$/) || (!regex1.test(userInput) && !regex2.test(userInput))) {
      alert("Please enter a playlist URL! (spotify:playlist:{id} or https://open.spotify.com/playlist/{id})");
    } else {
      let id = "";
      // Check if userInput matches the first format
      if (regex1.test(userInput)) {
        id = userInput.match(regex1)[1];
      } 
      // Check if userInput matches the second format
      else if (regex2.test(userInput)) {
        id = userInput.match(regex2)[1];
      } 
      console.log("Getting playlist with ID: " + id);

      var playlistParams = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.props.user.accessToken,
        },
      };

      await fetch(
        "https://api.spotify.com/v1/playlists/" + id + "/tracks",
        playlistParams
      )
        .then((response) => response.json())
        .then((data) => {
          this.setState({
            songList: data.items.map((item) => item.track),
          });
          console.log("Got playlist containing tracks: " + data.items.map((item) => item.track.name));
        });
      }
    };

      


  toggleComponentVisibility = () => {
    console.log("Toggling component visibility");
    this.setState(() => ({
      isOtherComponentVisible: !this.state.isOtherComponentVisible,
    }));
  };

  handleTrackSubmit = () => {
    if (this.state.song) {
      this.setState({
        isOtherComponentVisible: true,
      });
      const idData = {
        gameId: this.props.gameid,
        userName: this.props.user.username,
        song: this.state.song,
      };
      socket.emit("new song", idData);
    } else {
      alert("Please select a song!");
    }
  };

  handlePlaylistSubmit = () => {
    if(this.state.songList) {
      // randomly select a song from the song list
      const randomIndex = Math.floor(Math.random() * this.state.songList.length);
      const song = this.state.songList[randomIndex];
      // remove song from song list so it can't be selected again
      this.setState({
        songList: this.state.songList.filter((item, index) => index !== randomIndex),
        song: song,
      });
      this.setState({
        isOtherComponentVisible: true,
      });
      const idData = {
        gameId: this.props.gameid,
        userName: this.props.user.username,
        song: song,
      };
      socket.emit("new song", idData);
    }
  }

  handleSearchTypeChange = (event) => {
    this.setState({
      searchType: event.target.value,
      songList: null,
      isListVisible: false,
    });
  }
  
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
          <div className="container">
            <h1> Search for a song! </h1>
            <label>
              <input
                type="radio"
                value="track"
                checked={this.state.searchType === 'track'}
                onChange={this.handleSearchTypeChange}
              />
              Song Search
            </label>
            <label>
              <input
                type="radio"
                value="playlist"
                checked={this.state.searchType === 'playlist'}
                onChange={this.handleSearchTypeChange}
              />
              Playlist Search
            </label>
            <div>
              {this.state.searchType === "playlist" ? (
                <SubmitButton handleSubmit={this.handlePlaylistSubmit} song={this.state.songList} />
              ) : (
                <SubmitButton handleSubmit={this.handleTrackSubmit} song={this.state.song} />
              )}
            </div>
            <div>
              <input 
                ref={this.userInput} 
                placeholder={this.state.searchType === 'track' ? 'Search for a song...' : 'Enter a playlist URL...'}
                />
            </div>
            <div className="container">
              <SongList isListVisible={this.state.isListVisible} songList={this.state.songList} handleRowClick={this.handleRowClick} />
            </div>
            <div>
              {this.state.searchType === "playlist" ? (
              <SearchButton handleSearch={this.handlePlaylistSearch} searchType={"playlist"} />
                ):
              <SearchButton handleSearch={this.handleTrackSearch} searchType={"track"} />
              } 
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
  const [openNewWindow, setOpenNewWindow] = useState(false); // For opening a seperate window to view scores, without things like the song title etc. being shown
  const [scores, setScores] = useState([]);
  const [resumePlayer, setResumePlayer] = useState(null);
  const [pausePlayer, setPausePlayer] = useState(null);
  const [guessingPlayer, setGuessingPlayer] = useState("");
  const [play, setPlay] = useState(null);
  const [winner, setWinner] = useState("");

  // useEffect(() => {
  //   console.log("Fetching Spotify token");
  //   fetch(BACKEND_URL + "/spotify-public-token") //for not logged in users
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setAccessToken(data.access_token);
  //     })
  //     .catch((error) => console.error("Error: ", error));
  // }, []);

  useEffect(() => {
    if(props.isHost) {
      fetch(BACKEND_URL + "/spotify-token")
        .then((response) => response.json())
        .then((data) => {
          setAccessToken(data.access_token);
          console.log("Access token: " + data.access_token);
        })
        .catch((error) => console.error("Error: ", error));
    }
  })

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    setupWebPlayer(accessToken)
      .then(({resumePlayer, pausePlayer, play}) => {
        setResumePlayer(() => resumePlayer);
        setPausePlayer(() => pausePlayer);
        setPlay(() => play);
        console.log("Music player set up");
      })
  }, [accessToken]);

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

  const handleOpenNewWindow = () => {
    setOpenNewWindow(true);
  }

  const handleCloseNewWindow = () => {
    setOpenNewWindow(false);
  }

  const handleReset = () => {
    setDidStart(false);
    setWinner("");
    setScores([]);
  }

  const PlayerList = ({ opponentUserNames, isHost }) => (
    <div>
      <h2>
        Current {isHost ? 'players' : 'opponents'}:{" "}
        {opponentUserNames && opponentUserNames.length > 1 && opponentUserNames.join(", ")}
      </h2>
    </div>
  );

  return (
    <div>
      {didStart ? (
        <React.Fragment>
          {winner !== "" ? (
            <div>
            <h1>Game over! {winner} wins!</h1>
            {props.isHost && (
              <button class="buzzer" onClick={handleReset}>
                Reset
              </button> // TODO
            )}
          </div>
          ) : (
            <GTSGameSelector
            user={{ accessToken, host: props.isHost, username: props.myUserName }}
            gameid={gameid}
            opponentUserNames={opponentUserNames}
            scores={scores}
            setScores={setScores}
            setGuessingPlayer={setGuessingPlayer}
            guessingPlayer={guessingPlayer}
            resumePlayer={resumePlayer}
            pausePlayer={pausePlayer}
            play={play}
            setWinner={setWinner}
          />
          )}

          <div>
            <button class="newWindowButton" onClick={handleOpenNewWindow}>Scores Only</button>
            {openNewWindow && (
              <NewWindow onUnload={handleCloseNewWindow}>
                <div class="App">
                  <ScoreView scores={scores} guessingPlayer={guessingPlayer} winner={winner}/>
                </div>
              </NewWindow>
            )}
          </div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div>
            <h1 class="copyEffect" onClick={copyURL}>
              Share the game link with others!
            </h1>
            <PlayerList opponentUserNames={opponentUserNames} isHost={props.isHost} />
          </div>
          <div>
            {props.isHost &&
              opponentSocketIDs &&
              opponentSocketIDs.length > 1 && (
                <button
                  className="hoverButton"
                  onClick={() => {
                    const idData = {
                      gameId: gameid,
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
