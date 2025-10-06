"use client";

import {useState, useEffect, useCallback} from "react";

interface ICaretProps {
  charRefs: React.RefObject<HTMLSpanElement | null>[];
  userPosition: number;
}

function Caret(props: ICaretProps) {
  const {charRefs, userPosition} = props;
  const [caretPosition, setCaretPosition] = useState({top: 0, left: 0});
  const [blinking, setBlinking] = useState(true);

  useEffect(() => {
    const blinkingTimeout = setTimeout(() => {
      setBlinking(true);
    }, 500);

    setBlinking(false);

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

  useEffect(() => {
    updateCaretPosition(userPosition);
  }, [userPosition, updateCaretPosition]);

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
