import React from "react";

function Coin(props) {
  const { coin } = props;

  return (
    <div
      className="Coin grid-cell"
      style={{
        transform: `translate3d(${16 * coin.x + "px"}, ${
          16 * coin.y - 4 + "px"
        }, 0)`,
      }}
    >
      <div className="Coin_shadow grid-cell"></div>
      <div className="Coin_sprite grid-cell"></div>
    </div>
  );
}

export default Coin;
