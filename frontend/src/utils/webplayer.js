// WebPlayer component from spotify web playback sdk

function setupWebPlayer(access_token) {
  return new Promise((resolve) => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Guess The Song Player",
        getOAuthToken: (cb) => {
          cb(access_token);
        },
        volume: 0.5,
      });

      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);

        function play(uri) {
          fetch(
            `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
            {
              method: "PUT",
              body: JSON.stringify({ uris: [uri] }),
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access_token}`,
              },
            }
          );
        }

        function pausePlayer() {
          fetch(
            `https://api.spotify.com/v1/me/player/pause?device_id=${device_id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access_token}`,
              }
            }
          )
        }

        function resumePlayer() {
          fetch(
            `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access_token}`,
              }
            }	
          )
        }

        resolve({resumePlayer, pausePlayer, play})
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.addListener("initialization_error", ({ message }) => {
        console.error("init error: " + message);
      });
      player.addListener("authentication_error", ({ message }) => {
        console.error("auth error: " + message);
      });
      player.addListener("account_error", ({ message }) => {
        console.error("acc error: " + message);
      });
      player.addListener("playback_error", ({ message }) => {
        console.error("playback error: " + message);
      });

      player.connect().then((success) => {
        if (success) {
          console.log("Successfully connected SDK to Spotify");
        }
      });
    };
  });
}

export default setupWebPlayer;
