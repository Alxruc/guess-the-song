/**
 * Here is where we should register event listeners and emitters. 
 */

var io
var gameSocket
// gamesInSession stores an array of all active socket connections
var gamesInSession = []
// This object will hold the players for each game
var playersInGames = [];

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
        "start game": startGame,
        "correct guess": correctGuess,
        "wrong guess": wrongGuess,
        "skip": songSkip
    };

    // Register the events
    registerSocketEvents(gameSocket, events);
};


function getExistingPlayers(gameId) {
    // Return the players for the given game ID
    return playersInGames[gameId] || [];
}

function playerJoinsGame(idData) {
    console.log("Player " + idData.userName + " is attempting to join game: " + idData.gameId);
    var socket = this;

    socket.join(idData.gameId);

    // Add the player to the playersInGames object
    if (!playersInGames[idData.gameId]) {
        playersInGames[idData.gameId] = [];
    }
    if(!idData.isHost) {
        // The host doesnt play
        playersInGames[idData.gameId].push({ userName: idData.userName, socketId: socket.id, score: 0, canGuess: true});
    }
    
    const existingPlayers = getExistingPlayers(idData.gameId);

    io.sockets.in(idData.gameId).emit('opponent joined', existingPlayers)
}

function onDisconnect() {
    var socket = this

    // Remove this socket from the list of connected sockets
    gamesInSession.splice(gamesInSession.indexOf(socket), 1);
}

function startGame(idData) {
    var socket = this;

    socket.broadcast.to(idData.gameId).emit('game started');
}

function newSong(idData) {
    var socket = this;
    console.log("New song: " + idData.song.name + " for game: " + idData.gameId)
    
    socket.broadcast.to(idData.gameId).emit('song selected', idData);
}

function newGuess(idData) {
    var socket = this
    console.log("New guess for game: " + idData.gameId + " from: " + idData.userName);
    socket.broadcast.to(idData.gameId).emit('player guessed', idData);
}

function createNewGame(gameId) {
    console.log("Creating new game with ID: " + gameId);
    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    this.emit('createNewGame', { gameId: gameId, mySocketId: this.id })

    // Join the Room and wait for the players
    this.join(gameId)
}

function correctGuess(idData) {
    var socket = this
    var player = playersInGames[idData.gameId].find(player => player.userName == idData.username);
    
    if (player) {
        // Increase the player's score
        player.score += 1;
    }
    playersInGames[idData.gameId].forEach(player => player.canGuess = true); // reset all players to be able to guess again
    
    socket.broadcast.to(idData.gameId).emit('player correct', player);
}

function wrongGuess(idData) {
    var socket = this
    playersInGames[idData.gameId].find(player => player.userName == idData.username).canGuess = false;

    var roundOver = playersInGames[idData.gameId].every(player => player.canGuess === false);
    console.log(playersInGames[idData.gameId]);

    // If all players have canGuess set to false, add a new property to idData
    if (roundOver) {
        idData.roundOver = true;
        playersInGames[idData.gameId].forEach(player => player.canGuess = true); // reset all players to be able to guess again
    }

    io.to(idData.gameId).emit('player wrong', idData);
}

function songSkip(idData) {
    var socket = this
    playersInGames[idData.gameId].forEach(player => player.canGuess = true); // reset all players to be able to guess again
    socket.broadcast.to(idData.gameId).emit('song skip');
}

module.exports = { initializeGame };