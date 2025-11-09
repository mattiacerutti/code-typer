import {useState, useEffect} from "react";

interface ICaretProps {
  charRefs: React.RefObject<HTMLSpanElement | null>[];
  userPosition: number;
}

function Caret(props: ICaretProps) {
  const {charRefs, userPosition} = props;
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    const blinkingTimeout = setTimeout(() => {
      setBlinking(true);
    }, 500);

    return () => {
      setBlinking(false);
      clearTimeout(blinkingTimeout);
    };
  }, [userPosition]);

  const ref = charRefs[userPosition]?.current;
  const caretPosition = {
    top: ref?.offsetTop ?? 0,
    left: ref?.offsetLeft ?? 0,
  };
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
