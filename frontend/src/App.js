import "./App.css";
import React, { useState } from "react";
import { PlayerContext } from "./utils/context.js";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Creation from "./utils/creation.js";
import JoinGame from "./utils/joingame.js";
import GTSGame from "./utils/gtsgame.js";

// Inspiration / Help from https://github.com/JackHeTech/multiplayer-chess-game throughout this project

function App() {
  const [name, setName] = React.useState("");

  const [didRedirect, setDidRedirect] = React.useState(false);

  const playerDidRedirect = React.useCallback(() => {
    setDidRedirect(true);
  }, []);

  const playerDidNotRedirect = React.useCallback(() => {
    setDidRedirect(false);
  }, []);

  return (
    <div className="App">
      <PlayerContext.Provider
        value={{
          didRedirect: didRedirect,
          playerDidRedirect: playerDidRedirect,
          playerDidNotRedirect: playerDidNotRedirect,
        }}
      >
        <Router>
          <Routes>
            <Route path="/" element={<Creation setName={setName} setDidRedirect={setDidRedirect} />} />
            <Route
              path="/game/:gameid"
              element={
                <React.Fragment>
                  {didRedirect ? (
                    <>
                      <JoinGame userName={name} isHost={true} />
                      <GTSGame myUserName={name} />
                    </>
                  ) : (
                    <p> TODO1 </p>
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
