/**
 * Here is where we should register event listeners and emitters. 
 */

var io
var gameSocket
// gamesInSession stores an array of all active socket connections
var gamesInSession = []


const registerSocketEvents = (socket, events) => {
    Object.keys(events).forEach(event => {
        socket.on(event, events[event]);
    });
};

const initializeGame = (sio, socket) => {
    console.log('Initializing game');
    /**
     * initializeGame configures all the socket event listeners. 
     */

    // Set global variables.
    io = sio;
    gameSocket = socket;

    // Add this socket to an array that holds all the active sockets.
    gamesInSession.push(gameSocket);

    // Define the events and their handlers
    const events = {
        "disconnect": onDisconnect,
        "new song": newSong,
        "new guess": newGuess,
        "createNewGame": createNewGame,
        "playerJoinGame": playerJoinsGame,
        "request username": requestUserName,
        "recieved username": recievedUserName
    };

    // Register the events
    registerSocketEvents(gameSocket, events);
};

function playerJoinsGame(idData) {
    console.log("Player " + idData.userName + " is attempting to join game: " + idData.gameId);
    // var socket = this
    
    // // Look up the room ID in the Socket.IO manager object.
    // var room = io.sockets.adapter.rooms[idData.gameId]

    // socket.join(idData.gameId);

    // //TODO conditions for starting the game, this is currently only for testing
    // io.sockets.in(idData.gameId).emit('start game', idData.userName)
}

function onDisconnect() {
    var socket = this

    // Remove this socket from the list of connected sockets
    gamesInSession.splice(gamesInSession.indexOf(socket), 1);
}

function newSong() {
    var socket = this
    //TODO
}

function newGuess() {
    var socket = this
    //TODO
}

function createNewGame(gameId) {
    console.log("Creating new game with ID: " + gameId);
    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    this.emit('createNewGame', { gameId: gameId, mySocketId: this.id })

    // Join the Room and wait for the players
    this.join(gameId)
}

function requestUserName() {
    var socket = this
    //TODO
}

function recievedUserName() {
    var socket = this
    //TODO
}

module.exports = { initializeGame };