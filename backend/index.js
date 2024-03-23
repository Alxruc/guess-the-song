const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const gameLogic = require("./game-logic");
const fetch = require("cross-fetch");
const cors = require("cors");
const request = require("request");
const querystring = require("querystring");
const { FRONTEND_URL } = require("./config");
require('dotenv').config()
const app = express();

const frontendOrigin = FRONTEND_URL; 
const redirect_uri = "http://localhost:8000/callback"; // Your redirect uri


var access_token = '';

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
  "/spotify-public-token",
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

app.get("/spotify-login", (req, res) => {
  var state = Math.random().toString(36).substring(2, 17);
  var scope = 'user-read-private user-read-email';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.CLIENT_ID,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});


app.get('/callback', function(req, res) {

  var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if(!error && response.statusCode === 200) {
        console.log("Successfully set access token")
        access_token = body.access_token;
        res.redirect(frontendOrigin + "/");
      }
    })
  }
});

app.get("/spotify-token", (req, res) => { 
  console.log("Sending token")
  if (!access_token || access_token === '') {
    res.status(400).json({ error: 'Access token is not defined' });
  } else {
    res.json({ access_token });
  }
})


const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
