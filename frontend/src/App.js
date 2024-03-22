import "./App.css";
import React, {useEffect} from "react";
import { PlayerContext } from "./utils/context.js";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Creation from "./utils/creation.js";
import JoinGame from "./utils/joingame.js";
import GTSGameSelector from "./utils/gtsgameselector.js";
import JoinRoom from "./utils/joinroom.js";
import "./App.css";
import { BACKEND_URL } from "./config.js";

// Inspiration / Help from https://github.com/JackHeTech/multiplayer-chess-game throughout this project

function App() {
  const [name, setName] = React.useState("");

  const [didRedirect, setDidRedirect] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [token, setToken] = React.useState("");

  const playerDidRedirect = React.useCallback(() => {
    setDidRedirect(true);
  }, []);

  const playerDidNotRedirect = React.useCallback(() => {
    setDidRedirect(false);
  }, []);

  const loginWithSpotify = () => {
    window.location.href = BACKEND_URL + "/spotify-login";
  };

  async function getToken() {
    const response = await fetch(BACKEND_URL + '/spotify-token');
    const text = await response.json(); // Get response as text
    console.log(text); // Log the response
  } 

  const toggleMute = React.useCallback(() => {
    let audioButton = document.getElementById("muteButton");

    if (audioButton.className == "mute-button") {
      audioButton.className = "unmute-button";
    } else {
      audioButton.className = "mute-button";
    }
    setMuted((prevMuted) => !prevMuted);
  }, []);

  return (
    <div className="App">
      <div>
        <h1 class="gts-title"> Guess the Song! </h1>
      </div>
      <button onClick={loginWithSpotify}> Login With Spotify </button>
      <button onClick={getToken}> Test </button>
      <button id="muteButton" class="mute-button" onClick={toggleMute}>
        {muted ? "Unmute" : "Mute"}
      </button>
      <PlayerContext.Provider
        value={{
          muted: muted,
          didRedirect: didRedirect,
          playerDidRedirect: playerDidRedirect,
          playerDidNotRedirect: playerDidNotRedirect,
        }}
      >
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <Creation setName={setName} setDidRedirect={setDidRedirect} />
              }
            />
            <Route
              path="/game/:gameid"
              element={
                <React.Fragment>
                  {didRedirect ? (
                    <>
                      <JoinGame userName={name} isHost={true} />
                      <GTSGameSelector myUserName={name} isHost={true} />
                    </>
                  ) : (
                    <JoinRoom />
                  )}
                </React.Fragment>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </PlayerContext.Provider>
    </div>
  );
}

export default App;
