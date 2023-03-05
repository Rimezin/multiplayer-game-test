import { update } from "firebase/database";
import React from "react";
import { playerConfig } from "../config";
import Icon from "./Icon";

function PlayerInfo(props) {
  const {
    playerRef,
    playersInfo,
    playerId,
    handleSoundMute,
    muteSound,
    musicPlaying,
    handleMusic,
  } = props;

  const handleNameChange = (e) => {
    const newName = e.target.value || playerConfig.createName();
    update(playerRef, {
      name: newName,
    });
  };

  const handleColorClick = (e) => {
    const mySkinIndex = playerConfig.colors.indexOf(
      playersInfo[playerId].color
    );
    const nextColor =
      playerConfig.colors[mySkinIndex + 1] || playerConfig.colors[0];
    update(playerRef, {
      color: nextColor,
    });
  };

  return (
    <div className="player-info">
      <div>
        <label htmlFor="player-name">Your Name</label>
        <input
          id="player-name"
          maxLength="10"
          type="text"
          value={playersInfo[playerId].name}
          onChange={handleNameChange}
        />
      </div>
      <div>
        <button
          id="player-color"
          onClick={handleColorClick}
          style={{ backgroundColor: playersInfo[playerId].color }}
        >
          Change Color
        </button>
        <button
          id="player-mute"
          className={muteSound ? "gray" : ""}
          onClick={handleSoundMute}
        >
          {muteSound ? (
            <Icon icon="volume-mute-fill" size="20px" />
          ) : (
            <Icon icon="volume-up-fill" size="20px" />
          )}
          Sounds
        </button>
        <button
          id="player-music"
          className={!musicPlaying ? "gray" : ""}
          onClick={handleMusic}
        >
          {!musicPlaying ? (
            <Icon icon="bell-slash-fill" size="20px" />
          ) : (
            <Icon icon="bell-fill" size="20px" />
          )}
          Music
        </button>
      </div>
    </div>
  );
}

export default PlayerInfo;
