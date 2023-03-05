import React from "react";
import PlayerInfo from "./components/PlayerInfo";
import { Util } from "./util";
import { mapConfig, playerConfig } from "./config";
import {
  onDisconnect,
  ref,
  set,
  onChildAdded,
  onChildRemoved,
  onValue,
  remove,
  update,
} from "firebase/database";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import Character from "./components/Character";
import Coin from "./components/Coin";
import useKeyDown from "./hooks/useKeyDown";
import useStickyState from "./hooks/useStickyState";

// Sounds //
import useSound from "use-sound";
import coin from "./sounds/coin.wav";
import joined from "./sounds/joined.wav";
import exit from "./sounds/exit.wav";
import toggle from "./sounds/toggle.wav";
import pixelland from "./sounds/Pixelland.mp3";
/*
"Pixelland" Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/
*/

const allPlayersRef = ref(db, `players`);
const allCoinsRef = ref(db, `coins`);

export default function App() {
  // Global render toggle to prevent async errors //
  const [init, setInit] = React.useState(false);
  React.useEffect(() => {
    console.warn("Rerendered app!");
  }, []);

  /////////////////////////////////////////////////////////////////////
  //// SOUNDS /////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////
  const [playCoin] = useSound(coin, { volume: "0.1" });
  const [playJoined] = useSound(joined, { volume: "1.0" });
  const [playExit] = useSound(exit, { volume: "1.0" });
  const [playToggle] = useSound(toggle, { volume: "0.2" });
  const [muteSound, setMuteSound] = useStickyState(
    false,
    "multi-test-game-mute"
  );

  const handleSound = (sound) => {
    if (!muteSound) {
      switch (sound) {
        case "coin":
          playCoin();

          break;
        case "joined":
          playJoined();
          break;
        case "exit":
          playExit();
          break;
        case "toggle":
          playToggle();
          break;
        default:
          break;
      }
    }
  };

  const handleSoundMute = () => {
    setMuteSound(!muteSound);
    handleSound("toggle");
  };

  ///////////////////////////////////////////////////////////////////
  //// Music ////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////
  const [musicPlaying, setMusicPlaying] = useStickyState(
    true,
    "multi-test-game-music"
  );
  const [playMusic, { pause }] = useSound(pixelland, {
    loop: true,
    autoplay: musicPlaying,
    volume: 0.1,
  });

  function handleMusic() {
    handleSound("toggle");
    setMusicPlaying(!musicPlaying);
    if (!musicPlaying) {
      playMusic();
    } else {
      pause();
    }
  }

  // Simulate Click to start Music //
  // React.useEffect(() => {
  //   document.getElementById("root").click();
  // }, []);

  ////////////////////////////////////////////////////////////////////
  //// PLAYERS ///////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////
  const [playerId, setPlayerId] = React.useState();
  const [playerRef, setPlayerRef] = React.useState();
  const [playersInfo, setPlayersInfo] = React.useState({});
  const [playerElements, setPlayerElements] = React.useState({});
  const [renderPlayerElements, setRenderPlayerElements] = React.useState([]);

  React.useEffect(() => {
    setRenderPlayerElements(
      Object.keys(playerElements).map((element) => playerElements[element])
    );
  }, [playerElements]);

  //Fires whenever a change occurs to playersRef
  React.useEffect(() => {
    onValue(allPlayersRef, (snapshot) => {
      // Update Players Info
      const updatedPlayers = snapshot.val() || {};
      setPlayersInfo(updatedPlayers);

      // Update Player Elements
      let newPlayerElements = {};
      Object.keys(updatedPlayers).forEach((key) => {
        const character = updatedPlayers[key];
        newPlayerElements[character.id] = (
          <Character
            key={character.id}
            characterId={character.id}
            playerId={playerId}
            characterCoins={character.coins}
            characterName={character.name}
            characterColor={character.color}
            characterDirection={character.direction}
            coordinates={{
              x: 16 * character.x + "px",
              y: 16 * character.y - 4 + "px",
            }}
          />
        );
      });

      setPlayerElements(newPlayerElements);
    });
  }, []);

  //Fires whenever a new node is added to the playersRef
  React.useEffect(() => {
    onChildAdded(allPlayersRef, (snapshot) => {
      const character = snapshot.val();
      setPlayerElements((oldPlayerElements) => {
        return {
          ...oldPlayerElements,
          [character.id]: (
            <Character
              key={character.id}
              characterId={character.id}
              playerId={playerId}
              characterCoins={character.coins}
              characterName={character.name}
              characterColor={character.color}
              characterDirection={character.direction}
              coordinates={{
                x: 16 * character.x + "px",
                y: 16 * character.y - 4 + "px",
              }}
            />
          ),
        };
      });
      handleSound("joined");
    });
  }, []);

  //Remove character DOM element after they leave
  React.useEffect(() => {
    onChildRemoved(allPlayersRef, (snapshot) => {
      const removedKey = snapshot.val().id;
      setPlayerElements((oldPlayerElements) => ({
        ...oldPlayerElements,
        [removedKey]: undefined,
      }));
      handleSound("exit");
    });
  }, []);

  ////////////////////////////////////////////////////////////////////
  //// COINS /////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////
  const [coins, setCoins] = React.useState({});
  const [coinElements, setCoinElements] = React.useState({});
  const [renderCoinElements, setRenderCoinElements] = React.useState([]);

  React.useEffect(() => {
    setRenderCoinElements(
      Object.keys(coinElements).map((element) => coinElements[element])
    );
  }, [coinElements]);

  const placeCoin = () => {
    const { x, y } = mapConfig.getSafeSpot();
    const keyString = Util.getKeyString(x, y);
    let isEmpty = true;

    // Prevent from dropping a coin on
    Object.keys(playersInfo).forEach((player) => {
      if (isEmpty) {
        const playerPosition = Util.getKeyString(player.x, player.y);
        isEmpty = keyString !== playerPosition;
      }
    });

    if (Util.isEmpty(coins[keyString]) && isEmpty) {
      console.log("New coin added:", keyString);
      const coinRef = ref(db, `coins/${keyString}`);
      set(coinRef, {
        x,
        y,
      });
    }
  };

  React.useEffect(() => {
    const timeout = Util.randomFromArray(mapConfig.coinTimeouts);
    setTimeout(() => {
      placeCoin();
    }, timeout);
  }, [coins]);

  const attemptGrabCoin = (x, y) => {
    const key = Util.getKeyString(x, y);
    const coinExists = !Util.isEmpty(coins[key]);
    console.log(`Coin ${coinExists ? "exists" : "does not exist."}`);
    if (coinExists) {
      // Remove this key from data
      const coinToRemove = ref(db, `coins/${key}`);
      remove(coinToRemove);
      console.log("removed coin", key);
      handleSound("coin");

      // remove the coin locally
      setCoins((oldCoins) => ({
        ...oldCoins,
        [key]: undefined,
      }));

      // Uptick Player's coin count
      update(playerRef, {
        coins: playersInfo[playerId].coins + 1,
      });
    }
  };

  React.useEffect(() => {
    onChildAdded(allCoinsRef, (snapshot) => {
      const coin = snapshot.val();
      const key = Util.getKeyString(coin.x, coin.y);

      setCoins((oldCoins) => ({
        ...oldCoins,
        [key]: true,
      }));

      setCoinElements((oldCoinElements) => {
        return {
          ...oldCoinElements,
          [key]: <Coin key={key} coin={coin} />,
        };
      });
    });
  }, []);

  React.useEffect(() => {
    onChildRemoved(allCoinsRef, (snapshot) => {
      const { x, y } = snapshot.val();
      const keyToRemove = Util.getKeyString(x, y);

      setCoinElements((oldCoinElements) => ({
        ...oldCoinElements,
        [keyToRemove]: undefined,
      }));
    });
  }, []);

  ////////////////////////////////////////////////////////////////////
  //// AUTH //////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////
  React.useEffect(() => {
    try {
      onAuthStateChanged(auth, (user) => {
        console.log("Auth state changed:", user);
        if (user) {
          //You're logged in!
          const stateRef = ref(db, `players/${user.uid}`);
          setPlayerRef(stateRef);
          const name = playerConfig.createName();
          const { x, y } = mapConfig.getSafeSpot();
          set(stateRef, {
            id: user.uid,
            name,
            direction: "right",
            color: Util.randomFromArray(playerConfig.colors),
            x,
            y,
            coins: 0,
          });
          //Remove me from Firebase when I diconnect
          onDisconnect(stateRef).remove();
          setPlayerId(user.uid);
        } else {
          //You're logged out.
          console.log("Logged out");
        }
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  // Handle authentication
  React.useEffect(() => {
    signInAnonymously(auth)
      .then(() => {
        console.log("Signed-in Anonymously");
      })
      .catch((error) => {
        console.log(error.code, error.message);
      });
  }, []);

  // Handle arrows
  function handleArrowPress(xChange, yChange) {
    const newX = playersInfo[playerId].x + xChange;
    const newY = playersInfo[playerId].y + yChange;

    if (!mapConfig.isSolid(newX, newY)) {
      let newDirection = playersInfo[playerId].direction;
      if (xChange === 1) {
        newDirection = "right";
      }
      if (xChange === -1) {
        newDirection = "left";
      }
      //move to the next space
      const newPlayersInfo = {
        ...playersInfo,
        [playerId]: {
          ...playersInfo[playerId],
          x: newX,
          y: newY,
          direction: newDirection,
        },
      };
      setPlayersInfo(newPlayersInfo);
      set(playerRef, newPlayersInfo[playerId]);
      attemptGrabCoin(newX, newY);
    }
  }

  useKeyDown(
    (key) => {
      // callback
      switch (key) {
        case "ArrowUp":
          handleArrowPress(0, -1);
          break;
        case "ArrowDown":
          handleArrowPress(0, 1);
          break;
        case "ArrowLeft":
          handleArrowPress(-1, 0);
          break;
        case "ArrowRight":
          handleArrowPress(1, 0);
          break;
        default:
          console.log(`Key "${key}" doesn't do anything.`);
          break;
      }
    },
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]
  );

  // Initialize the app when all required states have data
  React.useEffect(() => {
    if (Util.isAnyEmpty([playerId, playerRef, playersInfo])) {
      setInit(false);
    } else {
      setInit(true);
      placeCoin();
    }
  }, [playerId, playerRef, playersInfo]);

  return (
    <div>
      {init && (
        <PlayerInfo
          playerRef={playerRef}
          playersInfo={playersInfo}
          playerId={playerId}
          muteSound={muteSound}
          handleSoundMute={handleSoundMute}
          handleSound={handleSound}
          musicPlaying={musicPlaying}
          handleMusic={handleMusic}
        />
      )}
      <div className="game-container">
        {renderPlayerElements}
        {renderCoinElements}
      </div>
    </div>
  );
}
