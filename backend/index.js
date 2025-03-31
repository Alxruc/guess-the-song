const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const gameLogic = require("./game-logic");
const fetch = require("cross-fetch");
const cors = require("cors");
const axios = require("axios");
const querystring = require("querystring");
const { FRONTEND_URL } = require("./config");
require("dotenv").config();
const app = express();

const frontendOrigin = FRONTEND_URL;
const redirect_uri = "http://192.168.0.74:8000/callback"; // Your redirect uri

// TODO Change receiving access token to something better than a global variable
// Right now this is only temporary and to be used locally for testing
var access_token = "";

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

// Backup for if the user is not logged in, legacy code
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
  var scope = "streaming user-read-private user-read-email user-modify-playback-state";

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: process.env.CLIENT_ID,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

app.get("/callback", async function (req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
    return;
  }

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET).toString("base64"),
        },
      }
    );

    console.log("Successfully set access token");
    access_token = response.data.access_token;
    res.redirect(frontendOrigin + "/success");
  } catch (error) {
    console.error("Error fetching Spotify token:", error.response?.data || error.message);
  }
});

app.get("/spotify-token", (req, res) => {
  if (!access_token || access_token === "") {
    res.status(400).json({ error: "Access token is not defined" });
  } else {
    res.json({ access_token });
  }
});

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
