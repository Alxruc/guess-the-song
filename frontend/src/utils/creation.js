import React from "react";
import { PlayerContext } from "./context";
import { Navigate } from 'react-router-dom'
import { v4 as uuidv4 } from "uuid";

class CreateGame extends React.Component {
  state = {
    usernameAlreadyEntered: false,
    inputText: "",
    gameId: "",
  };

  constructor(props) {
    super(props);
    this.userInput = React.createRef();
  }

  handleInput = () => {
    this.setState({
      inputText: this.userInput.current.value,
    });
  };

  handleClick = () => {

    if (this.state.inputText.match(/^\s*$/)) {
        alert("Please enter a name!")
    } 
    else {
        this.send();
        this.setState({
            usernameAlreadyEntered: true
        })
    }

    
  };

  send = () => {
    //Create new room with UUID
    const newGameRoomId = uuidv4();
    
    this.setState({
      gameId: newGameRoomId,
    });
  };

  render() {
    return (
      <React.Fragment>
        {this.state.usernameAlreadyEntered ? (
          <Navigate to={"/game/" + this.state.gameId}>
            <button
              className="default-button"
              style={{
                marginLeft: String(window.innerWidth / 2 - 60) + "px",
                width: "120px",
              }}
            >
              Start Game
            </button>
          </Navigate>
        ) : (
          <div>
            <label>
              Username:
              <input
                name="username-input"
                ref={this.userInput}
                onChange={this.handleInput}
                placeholder="Enter Username"
              ></input>
            </label>
            <button className="default-button" onClick={this.handleClick}>
              Set Username
            </button>
          </div>
        )}
      </React.Fragment>
    );
  }
}

const Creation = (props) => {
  const player = React.useContext(PlayerContext);

  return (
    <CreateGame
      didRedirect={player.playerDidRedirect}
      setUserName={props.setUserName}
    />
  );
};

export default Creation;
