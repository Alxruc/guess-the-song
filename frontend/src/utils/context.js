import { createContext } from "react";

// For later checking if the player created the room or if it is a new player who joined and has to setup username

export const PlayerContext = createContext({
    didRedirect: false, 
    playerDidRedirect: () => {}, 
    playerDidNotRedirect: () => {}
})  