import { useMemo, useState, useCallback } from "react";

export const useKeyboardHandlerState = () => {
  const [stateUserPosition, setUserPosition] = useState({ lineIndex: 0, charIndex: 0 });

  const userPosition = useMemo(
    () => ({
      charIndex: stateUserPosition.charIndex,
      lineIndex: stateUserPosition.lineIndex,
    }),
    [stateUserPosition.charIndex, stateUserPosition.lineIndex]
  );

  const updateUserPosition = useCallback(
    ({ lineIndex, charIndex }: { lineIndex?: number; charIndex?: number }) => {
      if (lineIndex === undefined) {
        lineIndex = userPosition.lineIndex;
      }
      if (charIndex === undefined) {
        charIndex = userPosition.charIndex;
      }
      setUserPosition({ lineIndex, charIndex });
    },
    [userPosition]
  );

  return { userPosition, updateUserPosition };
};