import React from "react";

function Character(props) {
  const {
    characterId,
    playerId,
    characterCoins,
    characterName,
    characterColor,
    characterDirection,
    coordinates,
  } = props;
  return (
    <div
      className={`Character grid-cell ${characterId === playerId ? "you" : ""}`}
      data-color={characterColor}
      data-direction={characterDirection}
      style={{
        transform: `translate3d(${coordinates.x}, ${coordinates.y}, 0)`,
      }}
    >
      <div className="Character_shadow grid-cell"></div>
      <div className="Character_sprite grid-cell"></div>
      <div className="Character_name-container">
        <span className="Character_name">{characterName}</span>
        <span className="Character_coins">{characterCoins}</span>
      </div>
      <div className="Character_you-arrow"></div>
    </div>
  );
}

export default Character;
