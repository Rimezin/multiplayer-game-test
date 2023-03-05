import React from "react";

export default function useKeyDown(callback, keys) {
  const onKeyDown = (event) => {
    const wasAnyKeyPressed = keys.some((key) => event.key === key);
    if (wasAnyKeyPressed) {
      event.preventDefault();
      callback(event.key);
    }
  };
  React.useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);
}
