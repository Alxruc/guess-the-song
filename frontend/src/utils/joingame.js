import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
const socket = require("../connection/socket").socket;

const JoinGameRoom = (gameid, userName, isHost) => {
  const idData = {
    gameId: gameid,
    userName: userName,
    isHost: isHost,
  };
  console.log("Checking client socket connection:" + socket.connected); // should be true
  socket.emit("playerJoinGame", idData);
};

function JoinGame(props) {
  const { gameid } = useParams();

  const joinGameWhenConnected = () => {
    if (socket.connected) {
      JoinGameRoom(gameid, props.userName, props.isHost);
    } else {
      console.log("Socket not connected, trying again in 1 second");
      setTimeout(joinGameWhenConnected, 1000); //retry again in 1 second
    }
  };

  useEffect(() => {
    joinGameWhenConnected();
  }, []);

}

export default JoinGame;
