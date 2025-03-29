"use client";

import {useImperativeHandle, useState, useEffect, useCallback} from "react";

interface ICaretProps {
  charRefs: React.RefObject<HTMLSpanElement>[];
}

function Caret(props: ICaretProps & {ref: React.RefObject<{setCaretIndex: (position: number) => void}>}) {
  const {charRefs, ref} = props;


  const [caretPosition, setCaretPosition] = useState({top: 0, left: 0});

  const [caretIndex, setCaretIndex] = useState(0);

  const [blinking, setBlinking] = useState(true);

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
  }, [caretPosition, caretIndex]);

  const updateCaretPosition = useCallback((index: number) => {
    const charElement = charRefs[index].current;
    if (charElement) {
        const {offsetTop, offsetLeft} = charElement;
      setCaretPosition({top: offsetTop, left: offsetLeft});
    }
  }, [charRefs]);

  // Exposes our local function to the parent via the ref
  useImperativeHandle(ref, () => ({
    setCaretIndex: (position: number) => {
      setCaretIndex(position);
    },
  }));

  useEffect(() => {
    // Update cursor position every render
    updateCaretPosition(caretIndex);
  }, [caretIndex, updateCaretPosition]);

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
