import React, { useEffect, useState } from "react";
import { PlayerContext } from "./context";
import { useParams } from "react-router-dom";

class GTSGame extends React.Component {
  state = {
    points: 0,
    host: false,
    username: "",
    songURL: "",
  };

  constructor(props) {
    super(props);
    this.userInput = React.createRef();
    this.audio = React.createRef();
  }

  componentDidMount() {
    this.audio.current.volume = 0.05;
  }

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

      var trackID = await fetch(
        "https://api.spotify.com/v1/search?q=" + userInput + "&type=track",
        trackParams
      )
        .then((response) => response.json())
        .then((data) =>
          this.setState({
            songURL: data.tracks.items[0].preview_url
          })
        );
    }
  };

  playAudio = () => {
    console.log(this.audio.current.src);
    this.audio.current.play();
  };

  pauseAudio = () => {
    this.audio.current.pause();
  };

  render() {
    return (
      <React.Fragment>
        <div>
          <audio ref={this.audio} src={this.state.songURL}></audio>

          {this.state.songURL && (<button className="btn btn-primary" onClick={this.playAudio}>
            Play
          </button>)}
          <input ref={this.userInput}></input>
          {this.state.songURL && (<button className="btn btn-primary" onClick={this.pauseAudio}>
            Pause
          </button>)}
        </div>
        <div>
          <button className="btn btn-primary" onClick={this.handleSearch}>
            Search
          </button>
        </div>
      </React.Fragment>
    );
  }
}

const GameWrapper = (props) => {
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    console.log("Fetching Spotify token");
    fetch("http://localhost:8000/spotify-token")
      .then((response) => response.json())
      .then((data) => {
        setAccessToken(data.access_token);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  return <GTSGame accessToken={accessToken} />;
};

export default GameWrapper;
