import React from 'react';
import JoinGame from './joingame';
import GTSGame from './gtsgame';

class JoinRoom extends React.Component {
    state = {
        usernameAlreadyEntered: false,
        inputText: "",
      };

    constructor(props) {
        super(props);
        this.userInput = React.createRef();
    };

    handleInput = () => {
    this.setState({
        inputText: this.userInput.current.value,
    });
    };

    handleClick = () => {

    if (this.state.inputText.match(/^\s*$/)) {
        alert("Please enter a name!")
    } else {
        this.setState({
        usernameAlreadyEntered: true
        });
    }
    };

    render() {
        return (<React.Fragment>
            {
                this.state.usernameAlreadyEntered ? 
                <React.Fragment>
                    <JoinGame userName = {this.state.inputText} isHost = {false}/>
                    <GTSGame myUserName = {this.state.inputText}/>
                </React.Fragment>
            :
               <div>
                    <h1>Your Username:</h1>

                    <input ref = {this.userInput} onChange = {this.handleInput}></input>
                           
                    <button className="btn btn-primary"  
                        onClick = {this.handleClick}>Submit</button>
                </div>
            }
            </React.Fragment>)
    }
}

export default JoinRoom