import React from 'react';

class GTSGame extends React.Component {
    render() {
        return (<div>
            <h1>You've selected {this.props.song.name}</h1>
        </div>)
    }
}

export default GTSGame;