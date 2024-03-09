import io from 'socket.io-client'
import { BACKEND_URL } from '../config'

const socket = io(BACKEND_URL);

var mySocketId;


socket.on("createNewGame", statusUpdate => {
    console.log("A new game has been created! Username: " + statusUpdate.userName + ", Game id: " + statusUpdate.gameId + " Socket id: " + statusUpdate.mySocketId)
    mySocketId = statusUpdate.mySocketId
});

export {
    socket,
    mySocketId
}