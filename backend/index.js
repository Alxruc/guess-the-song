const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const gameLogic = require('./game-logic')
const app = express()

const server = http.createServer(app)
const io = require('socket.io')(server, {
    cors: {
      origin: "http://localhost:3000",  // Replace with your frontend's origin
      methods: ["GET", "POST"]
    }
});

io.on('connection', client => {
    console.log('A client connected');
    gameLogic.initializeGame(io, client)
})

const port = process.env.PORT || 8000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});