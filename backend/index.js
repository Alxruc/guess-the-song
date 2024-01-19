const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const gameLogic = require("./game-logic");
const fetch = require("cross-fetch");
const cors = require("cors");
require('dotenv').config()
const app = express();

const frontendOrigin = "http://localhost:3000"; // Replace with your frontend's origin

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: frontendOrigin,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (client) => {
  console.log("A client connected");
  gameLogic.initializeGame(io, client);
});

app.use(
  cors({
    origin: frontendOrigin, 
    methods: ["GET", "POST"],
  })
);

app.get(
  "/spotify-token",
  (req, res, next) => {
    const allowedOrigins = [frontendOrigin]; 
    const origin = req.headers.origin;
    if (!allowedOrigins.includes(origin)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  },
  async (req, res) => {
    const auth = Buffer.from(
      `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}` //must have a .env file in directory with these variables containing spotify dev ids
    ).toString("base64");
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: "grant_type=client_credentials",
    });

    console.log("Spotify response status: " + response.status);

    const data = await response.json();
    res.json(data);
  }
);

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
