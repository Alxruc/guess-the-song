/**
 * Here is where we should register event listeners and emitters. 
 */

// gamesInSession stores an array of all active socket connections
var gamesInSession = [];
// This object will hold the players for each game
var playersInGames = {};
// Tracks pending disconnect removal timers keyed by sessionId
var disconnectTimers = {};

const DISCONNECT_GRACE_MS = 10000; // 10 second grace period for refreshes

const registerSocketEvents = (socket, events) => {
    Object.keys(events).forEach(event => {
        socket.on(event, events[event]);
    });
};

const initializeGame = (io, socket) => {
    console.log(`Initializing game for connection: ${socket.id}`);
    /**
     * initializeGame configures all the socket event listeners. 
     */

    // Add this socket to an array that holds all the active sockets.
    gamesInSession.push(socket);

    // Define the events and their handlers
    const events = {
        "disconnect": () => onDisconnect(io, socket),
        "new song": (data) => newSong(socket, data),
        "new guess": (data) => newGuess(socket, data),
        "createNewGame": (data) => createNewGame(socket, data),
        "playerJoinGame": (data) => playerJoinsGame(io, socket, data),
        "start game": (data) => startGame(socket, data),
        "correct guess": (data) => correctGuess(socket, data),
        "wrong guess": (data) => wrongGuess(io, data),
        "skip": (data) => songSkip(socket, data)
    };

    // Register the events
    registerSocketEvents(socket, events);
};

function getExistingPlayers(gameId) {
    // Return the players for the given game ID
    return playersInGames[gameId] || [];
}

function playerJoinsGame(io, socket, idData) {
    const { gameId, userName, isHost } = idData;
    const sessionId = socket.request.sessionID;

    console.log("Player " + userName + " is attempting to join game: " + gameId);

    socket.join(gameId);

    // If this session had a pending disconnect removal, cancel it
    if (disconnectTimers[sessionId]) {
        clearTimeout(disconnectTimers[sessionId]);
        delete disconnectTimers[sessionId];
        console.log("Cancelled pending disconnect removal for session: " + sessionId);
    }

    // Add the player to the playersInGames object
    if (!playersInGames[gameId]) {
        playersInGames[gameId] = [];
    }

    let player = playersInGames[gameId].find(p => p.sessionId === sessionId);

    if (player) {
        // Reconnecting player — update their socket ID and username
        player.socketId = socket.id;
        player.userName = userName;
    } else {
        if (!isHost) {
            // The host doesnt play
            player = {
                userName: userName,
                socketId: socket.id,
                sessionId: sessionId,
                score: 0,
                canGuess: true
            };
            playersInGames[gameId].push(player);
        }
    }

    const existingPlayers = getExistingPlayers(gameId);

    io.sockets.in(gameId).emit('opponent joined', existingPlayers)
}

function onDisconnect(io, socket) {
    // Remove this socket from the list of connected sockets
    const index = gamesInSession.indexOf(socket);
    if (index !== -1) {
        gamesInSession.splice(index, 1);
    }

    const sessionId = socket.request.sessionID;

    // Instead of removing immediately, wait for the grace period.
    // If the same session reconnects within the grace period, the removal is cancelled.
    disconnectTimers[sessionId] = setTimeout(() => {
        delete disconnectTimers[sessionId];

        for (const gameId in playersInGames) {
            const playerIndex = playersInGames[gameId].findIndex(p => p.sessionId === sessionId);

            if (playerIndex !== -1) {
                console.log("Grace period expired, removing player with session: " + sessionId);
                playersInGames[gameId].splice(playerIndex, 1);
                io.sockets.in(gameId).emit('opponent joined', playersInGames[gameId]);
                break;
            }
        }
    }, DISCONNECT_GRACE_MS);
}

function startGame(socket, idData) {
    socket.broadcast.to(idData.gameId).emit('game started');
}

function newSong(socket, idData) {
    console.log("New song: " + idData.song.name + " for game: " + idData.gameId);
    socket.broadcast.to(idData.gameId).emit('song selected', idData);
}

function newGuess(socket, idData) {
    console.log("New guess for game: " + idData.gameId + " from: " + idData.userName);
    socket.broadcast.to(idData.gameId).emit('player guessed', idData);
}

function createNewGame(socket, gameId) {
    console.log("Creating new game with ID: " + gameId);
    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    socket.emit('createNewGame', { gameId: gameId, mySocketId: socket.id })

    // Join the Room and wait for the players
    socket.join(gameId)
}

function correctGuess(socket, idData) {
    if (!playersInGames[idData.gameId]) return;

    var player = playersInGames[idData.gameId].find(player => player.userName == idData.username);

    if (player) {
        // Increase the player's score
        player.score += 1;
    }
    playersInGames[idData.gameId].forEach(player => player.canGuess = true); // reset all players to be able to guess again

    socket.broadcast.to(idData.gameId).emit('player correct', player);
}

function wrongGuess(io, idData) {
    if (!playersInGames[idData.gameId]) return;

    const player = playersInGames[idData.gameId].find(player => player.userName == idData.username);
    if (player) {
        player.canGuess = false;
    }

    var roundOver = playersInGames[idData.gameId].every(player => player.canGuess === false);

    // If all players have canGuess set to false, add a new property to idData
    if (roundOver) {
        idData.roundOver = true;
        playersInGames[idData.gameId].forEach(player => player.canGuess = true); // reset all players to be able to guess again
    }

    io.to(idData.gameId).emit('player wrong', idData);
}

function songSkip(socket, idData) {
    if (!playersInGames[idData.gameId]) return;

    playersInGames[idData.gameId].forEach(player => player.canGuess = true); // reset all players to be able to guess again
    socket.broadcast.to(idData.gameId).emit('song skip');
}

module.exports = { initializeGame };