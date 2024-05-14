import React, { useState, useEffect } from "react";
import "./styling/scoreview.css";


function ScoreView(props) {
  

  return (
    <div>
      <h2>Scores:</h2>
      <div class="container">
        <div class="row">
          {Object.entries(props.scores).map(([username, score]) => (
            <div class="col">
              <div class="card">
                <div class="card-header" key={username}>
                  {username}
                </div>
                <div class="card-body">{score}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {props.guessingPlayer != "" && (
        <h2>Currently guessing: {props.guessingPlayer}</h2>
      )}
    </div>
  );
}

function ExternalView(props) {

  // Green flash when player scores
  const [prevScores, setPrevScores] = useState({});
  const [flashing, setFlashing] = useState({});

  useEffect(() => {
    const newFlashing = {};
    for (const [username, score] of Object.entries(props.scores)) {
      newFlashing[username] = score !== (prevScores[username] || 0);
    }
    setFlashing(newFlashing);

    const timer = setTimeout(() => {
      setFlashing({});
    }, 1000);

    return () => clearTimeout(timer);
  }, [props.scores]);

  useEffect(() => {
    setPrevScores(props.scores);
  }, [props.scores]);

  return (
    <React.Fragment>
    <div class="container">
      <h1 class="title">GUESS THE SONG!</h1>
    </div>
    <div class="container">
      <div class="row">
        <div class="col">
          <div class="" id="vinyl">
            <div id="vinyl-cover"></div>
            <div id="vinyl-disk">
            </div>
            
          </div>
        </div>
        {Object.entries(props.scores).map(([username, score]) => (
          <div class="col">
              <div className={`card ${flashing[username] ? 'flash active' : 'flash'}`}>
                <div class="card-header" key={username}>
                  {username}
                </div>
                <div class="card-body">{score}</div>
              </div>
          </div>
          ))}
        </div>

        <div class="row">
          <div class="col">
            {props.guessingPlayer != "" && 
            (<p id="guesser-name">Currently guessing: {props.guessingPlayer}</p>)}
          </div>
        </div>
    </div>
  </React.Fragment>
  )
}

export { ScoreView, ExternalView };
