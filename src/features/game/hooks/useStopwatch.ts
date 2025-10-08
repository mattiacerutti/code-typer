import {useRef, useCallback} from "react";

const useStopwatch = (onTick: (elapsedTime: number) => void) => {
  const startRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getTime = useCallback(() => {
    return startRef.current ? Date.now() - startRef.current : 0;
  }, []);

  const startStopwatch = useCallback(() => {
    if (intervalRef.current) return;
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => onTick(getTime()), 1);
  }, [onTick, getTime]);

  const stopStopwatch = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetStopwatch = useCallback(() => {
    stopStopwatch();
    startRef.current = null;
    onTick(0);
  }, [stopStopwatch, onTick]);

  return {startStopwatch, stopStopwatch, resetStopwatch, getTime};
};

export default useStopwatch;
