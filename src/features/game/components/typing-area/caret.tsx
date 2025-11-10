import {useState, useEffect, useLayoutEffect} from "react";

interface ICaretProps {
  charRefs: React.RefObject<HTMLSpanElement | null>[];
  userPosition: number;
}

function Caret({charRefs, userPosition}: ICaretProps) {
  const [blinking, setBlinking] = useState(false);
  const [caretPosition, setCaretPosition] = useState({top: 0, left: 0});

  useEffect(() => {
    const blinkingTimeout = setTimeout(() => setBlinking(true), 500);
    return () => {
      setBlinking(false);
      clearTimeout(blinkingTimeout);
    };
  }, [userPosition]);

  useLayoutEffect(() => {
    const ref = charRefs[userPosition];
    if (ref?.current) {
      const {offsetTop, offsetLeft} = ref.current;
      setCaretPosition({top: offsetTop, left: offsetLeft});
    }
  }, [charRefs, userPosition]);

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
    />
  );
}

export default Caret;
