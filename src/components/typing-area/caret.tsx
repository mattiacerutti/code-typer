"use client";

import {useGameState} from "@/contexts/GameStateContext";
import {GameStatus} from "@/types/game-state";
import {useState, useEffect, useCallback} from "react";

interface ICaretProps {
  charRefs: React.RefObject<HTMLSpanElement | null>[];
}

function Caret(props: ICaretProps) {
  const {charRefs} = props;

  const {state} = useGameState();
  const [caretPosition, setCaretPosition] = useState({top: 0, left: 0});

  const [blinking, setBlinking] = useState(true);

  if (state.status !== GameStatus.PLAYING && state.status !== GameStatus.READY) {
    throw new Error("Caret: Received invalid game status");
  }

  useEffect(() => {
    let blinkingTimeout: NodeJS.Timeout | null = null;

    // Clear any existing timeouts to reset the delay
    if (blinkingTimeout) {
      clearTimeout(blinkingTimeout);
    }

    // Remove the blinking animation class and set a timeout to add it after 0.5 seconds of inactivity
    setBlinking(false);
    blinkingTimeout = setTimeout(() => {
      setBlinking(true);
    }, 500);

    // Clean up the timeout on component unmount
    return () => clearTimeout(blinkingTimeout);
  }, [caretPosition]);

  const updateCaretPosition = useCallback(
    (index: number) => {
      const charElement = charRefs[index].current;
      if (charElement) {
        const {offsetTop, offsetLeft} = charElement;
        setCaretPosition({top: offsetTop, left: offsetLeft});
      }
    },
    [charRefs]
  );

  // Updates the cursor position anytime the user position changes
  useEffect(() => {
    updateCaretPosition(state.userPosition);
  }, [state.userPosition, updateCaretPosition]);

  return (
    <div
      className={`blinking-cursor ${blinking && "blinking-caret"}`}
      style={{
        position: "absolute",
        top: `${caretPosition.top + 4}px`,
        left: `${caretPosition.left - 2}px`,
        height: "30px",
        backgroundColor: "black",
        width: "3px",
        borderRadius: "10px",
        transition: "all 0.15s ease",
      }}
    ></div>
  );
}
export default Caret;
