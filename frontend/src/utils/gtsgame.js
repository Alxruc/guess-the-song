import React from 'react';
//const socket  = require('../connection/socket').socket

class GTSGame extends React.Component {
    render() {
        return (<React.Fragment>
        <div>
            <h1>Waiting for the other players to select their song...</h1>
        </div>
        <div>
            <h2>You've selected {this.props.song.name}</h2>
        </div>
        </React.Fragment>)
    }
}

const GTSWrapper = (props) => {


    return (<GTSGame {...props}/>)
} 

export default GTSGame;