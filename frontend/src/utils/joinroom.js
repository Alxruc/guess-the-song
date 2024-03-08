import React from "react";
import JoinGame from "./joingame";
import GTSGameSelector from "./gtsgameselector";

class JoinRoom extends React.Component {
  state = {
    usernameAlreadyEntered: false,
    inputText: "",
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
      alert("Please enter a name!");
    } else {
      this.setState({
        usernameAlreadyEntered: true,
      });
    }
  };

  render() {
    return (
      <React.Fragment>
        {this.state.usernameAlreadyEntered ? (
          <React.Fragment>
            <JoinGame userName={this.state.inputText} isHost={false} />
            <GTSGameSelector myUserName={this.state.inputText} />
          </React.Fragment>
        ) : (
          <div>
            <h1>Your Username:</h1>

            <div class="container">
              <input ref={this.userInput} onChange={this.handleInput}></input>

              <button className="hoverButton" onClick={this.handleClick}>
                Submit
              </button>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default JoinRoom;
