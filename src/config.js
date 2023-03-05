import { Util } from "./util";

const mapConfig = {
  minX: 1,
  maxX: 14,
  minY: 4,
  maxY: 12,
  blockedSpaces: {
    "7x4": true,
    "1x11": true,
    "12x10": true,
    "4x7": true,
    "5x7": true,
    "6x7": true,
    "8x6": true,
    "9x6": true,
    "10x6": true,
    "7x9": true,
    "8x9": true,
    "9x9": true,
  },
  isSolid: (x, y) => {
    const blockedNextSpace = mapConfig.blockedSpaces[Util.getKeyString(x, y)];
    return (
      blockedNextSpace ||
      x >= mapConfig.maxX ||
      x < mapConfig.minX ||
      y >= mapConfig.maxY ||
      y < mapConfig.minY
    );
  },
  safeSpots: [
    { x: 1, y: 4 },
    { x: 2, y: 4 },
    { x: 1, y: 5 },
    { x: 2, y: 6 },
    { x: 2, y: 8 },
    { x: 2, y: 9 },
    { x: 4, y: 8 },
    { x: 5, y: 5 },
    { x: 5, y: 8 },
    { x: 5, y: 10 },
    { x: 5, y: 11 },
    { x: 11, y: 7 },
    { x: 12, y: 7 },
    { x: 13, y: 7 },
    { x: 13, y: 6 },
    { x: 13, y: 8 },
    { x: 7, y: 6 },
    { x: 7, y: 7 },
    { x: 7, y: 8 },
    { x: 8, y: 8 },
    { x: 10, y: 8 },
    { x: 8, y: 8 },
    { x: 11, y: 4 },
  ],
  getSafeSpot: () => {
    return Util.randomFromArray(mapConfig.safeSpots);
  },
  coinTimeouts: [5000, 10000, 20000, 30000, 40000, 50000],
};

const playerConfig = {
  firstNames: [
    "COOL",
    "SUPER",
    "HIP",
    "SMUG",
    "COOL",
    "SILKY",
    "GOOD",
    "SAFE",
    "DEAR",
    "DAMP",
    "WARM",
    "RICH",
    "LONG",
    "DARK",
    "SOFT",
    "BUFF",
    "DOPE",
  ],
  lastNames: [
    "BEAR",
    "DOG",
    "CAT",
    "FOX",
    "LAMB",
    "LION",
    "BOAR",
    "GOAT",
    "VOLE",
    "SEAL",
    "PUMA",
    "MULE",
    "BULL",
    "BIRD",
    "BUG",
  ],
  createName: () => {
    const prefix = Util.randomFromArray(playerConfig.firstNames);
    const animal = Util.randomFromArray(playerConfig.lastNames);
    return `${prefix} ${animal}`;
  },
  colors: ["blue", "red", "orange", "yellow", "green", "purple"],
};

export { mapConfig, playerConfig };
