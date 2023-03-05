//// Utilities - Helper Functions ////

const Util = {
  randomFromArray: (array) => {
    return array[Math.floor(Math.random() * array.length)];
  },

  getKeyString: (x, y) => {
    return `${x}x${y}`;
  },

  isEmpty: (item) => {
    switch (typeof item) {
      case "undefined":
        return true;
      case "null":
        return true;
      case "object":
        if (Array.isArray(item)) {
          return item.length === 0;
        } else if (item === null) {
          return true;
        } else {
          return Object.keys(item).length === 0;
        }
      case "string":
        return item === "";
      case "number":
        return item <= 0;
      default:
        return false;
    }
  },

  // Multiple variable check //
  isAnyEmpty: (array) => {
    let returnValue = false;
    array.forEach((item) => {
      if (Util.isEmpty(item)) {
        returnValue = true;
      }
    });
    return returnValue;
  },
};

export { Util };
