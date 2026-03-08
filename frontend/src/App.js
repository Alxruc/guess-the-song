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
import { BACKEND_URL } from "./config.js";

// Inspiration / Help from https://github.com/JackHeTech/multiplayer-chess-game throughout this project

function App() {
  // Restore state from sessionStorage on mount (survives page refresh)
  const [name, setNameState] = React.useState(
    () => sessionStorage.getItem("gts_name") || ""
  );
  const [didRedirect, setDidRedirectState] = React.useState(
    () => sessionStorage.getItem("gts_didRedirect") === "true"
  );

  // Wrap setters so they also persist to sessionStorage
  const setName = React.useCallback((newName) => {
    sessionStorage.setItem("gts_name", newName);
    setNameState(newName);
  }, []);

  const setDidRedirect = React.useCallback((value) => {
    sessionStorage.setItem("gts_didRedirect", String(value));
    setDidRedirectState(value);
  }, []);

  const playerDidRedirect = React.useCallback(() => {
    setDidRedirect(true);
  }, [setDidRedirect]);

  const playerDidNotRedirect = React.useCallback(() => {
    setDidRedirect(false);
  }, [setDidRedirect]);

  const loginWithSpotify = () => {
    window.location.href = BACKEND_URL + "/spotify-login";
  };

  return (
    <div className="App">
      <div>
        <h1 class="gts-title"> Guess the Song! </h1>
      </div>
      <PlayerContext.Provider
        value={{
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
                <button class="spotify-button" onClick={loginWithSpotify}> Login With Spotify </button>
              }
            />
            <Route
              path="/success"
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
                      <GTSGameSelector myUserName={name} isHost={true}/>
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
