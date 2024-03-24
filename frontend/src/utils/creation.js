import React from "react";
import { PlayerContext } from "./context";
import { Navigate } from 'react-router-dom'
import { v4 as uuidv4 } from "uuid";
import './styling/creation.css';
const socket  = require('../connection/socket').socket

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
    } else {
      this.send();
      this.setState({
        usernameAlreadyEntered: true
      });
      this.props.setUserName(this.state.inputText);
      this.props.setDidRedirect(true);
    }

    
  };

  send = () => {
    //Create new room with UUID (shortened to 8 characters for simplicity)
    const newGameRoomId = uuidv4().substring(0,8);
    
    this.setState({
      gameId: newGameRoomId,
    });

    socket.emit('createNewGame', newGameRoomId)
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
            <h3 class="creationTitle"> Create a lobby by entering your username! </h3>
              <div class="container">
                <input
                  name="username-input"
                  ref={this.userInput}
                  onChange={this.handleInput}
                  placeholder="Username"
                ></input>
                <button className="hoverButton" onClick={this.handleClick}>
                  Set Username
                </button>  
              </div>
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
      setUserName={props.setName}
      setDidRedirect={props.setDidRedirect}
    />
  );
};

export default Creation;
