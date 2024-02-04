import React from "react";
//const socket  = require('../connection/socket').socket

class GTSGame extends React.Component {
    constructor(props) {
        super(props);
        this.audio = React.createRef();
    }

    componentDidMount() {
        this.audio.current.volume = 0.05;
        this.audio.current.play();
    }

    render() {
        return (
            <React.Fragment>
                <audio
                    ref={this.audio}
                    src={this.props.song ? this.props.song.preview_url : ""}
                ></audio>
                {this.props.host ? (
                    <div>
                        <h1>
                            You've selected {this.props.song.name}! Waiting for other players
                            to guess...
                        </h1>
                    </div>
                ) : (
                    <div>
                        <h1> What is the name of this song?</h1>
                    </div>
                )}
            </React.Fragment>
        );
    }
}

const GTSWrapper = (props) => {
  return <GTSGame {...props} />;
};

export default GTSGame;
