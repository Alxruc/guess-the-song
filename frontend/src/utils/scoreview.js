import React from "react";

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

export default ScoreView;
