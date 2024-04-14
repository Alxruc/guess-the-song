# Guess The Song
**IN DEVELOPMENT**

A web application where a group of people can play and see who can guess a given song the fastest!

## How to start
Firstly change the address in the given config.js files in the frontend and backend directory
Secondly in the backend/ folder create a file named .env and include the client id and client secret you get from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) after creating an application there. Create the file with the following format:
```
CLIENT_ID={your id here}
CLIENT_SECRET={your secret here}
```
Lastly start up the frontend and backend

### Frontend
- Navigate to the frontend folder and install the needed dependencies
- Build the frontend application
- Run
```
cd frontend
npm install
npm run build
serve -s build
```

### Backend
The backend is currently in a developmental/testing stage. It should not be hosted / used with untrusted players
- Navigate to the backend folder and install the needed dependenices
- Run the backend
```
cd backend
npm install
node index.js
```

## How to play
This game is meant to be played as a small party game.
The host opens the web application and logs in via their Spotify account. After entering a username, a lobby is created, this lobby URL can then be sent to the other players (at least 2 players are needed to start a game). After the at least two players join the game, the host can start the game and search for a song of their choosing. After pressing submit, the game starts and the players have to guess which song is currently playing (optionally include the artists). The player that first buzzes in gets to guess. The host can then decide whether the guess was right or wrong. If the guess was right, the player gets 1 point. If it is incorrect, the song continues. Each player can only guess once per round. 

