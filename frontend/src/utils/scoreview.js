import React from "react";

function ScoreView(props) {
  return (
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
  );
}

export default ScoreView;
