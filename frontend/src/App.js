import "./App.css";
import React from "react";
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

// Inspiration / Help from https://github.com/JackHeTech/multiplayer-chess-game throughout this project

function App() {
  const [name, setName] = React.useState("");

  const [didRedirect, setDidRedirect] = React.useState(false);
  const [muted, setMuted] = React.useState(false);

  const playerDidRedirect = React.useCallback(() => {
    setDidRedirect(true);
  }, []);

  const playerDidNotRedirect = React.useCallback(() => {
    setDidRedirect(false);
  }, []);

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
