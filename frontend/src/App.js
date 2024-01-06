import "./App.css";
import React, { useState } from "react";
import { PlayerContext } from "./utils/context.js";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Creation from "./utils/creation.js";

// Inspiration / Help from https://github.com/JackHeTech/multiplayer-chess-game

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
            <Route path="/" element={<Creation setName={setName} />} />
            <Route path="/game/:gameid" element={<p> TODO </p>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </PlayerContext.Provider>
    </div>
  );
}

export default App;
