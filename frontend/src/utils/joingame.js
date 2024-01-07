// TODO Game joining logic

import React, {useEffect} from 'react'
import { useParams } from 'react-router-dom'
const socket  = require('../connection/socket').socket

const JoinGameRoom = (gameid, userName, isHost) => {

    const idData = {
        gameId : gameid,
        userName : userName,
        isHost: isHost
    }
    console.log("Checking client socket connection:" + socket.connected); // should be true
    socket.emit("playerJoinGame", idData);
}

function JoinGame(props) {
    const { gameid } = useParams();

    socket.on('connect', () => {
        console.log("Checking client socket connection:" + socket.connected); // should be true
        JoinGameRoom(gameid, props.userName, props.isHost);
    });

    return(
        <div>
            <p> Is {props.userName} the host? {props.isHost} </p>
        </div>
    )
}

export default JoinGame;