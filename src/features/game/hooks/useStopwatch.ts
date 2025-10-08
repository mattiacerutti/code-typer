import {useRef, useCallback} from "react";

interface IUseStopwatchProps {
  onTick: (elapsedTime: number) => void;
  onInterval?: (elapsedTime: number) => void;
  intervalMs?: number;
}

const useStopwatch = (props: IUseStopwatchProps) => {
  const {onTick, onInterval, intervalMs = 1000} = props;

  const startRef = useRef<number | null>(null);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const customIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const customIntervalTicksRef = useRef<number>(1);

  const getTime = useCallback(() => {
    return startRef.current ? Date.now() - startRef.current : 0;
  }, []);

  const startStopwatch = useCallback(() => {
    if (tickIntervalRef.current) return;
    startRef.current = Date.now();

    // On tick every millisecond
    tickIntervalRef.current = setInterval(() => {
      if (onTick) onTick(getTime());
    }, 1);

    // Custom interval callback
    if (onInterval) {
      customIntervalRef.current = setInterval(() => {
        onInterval(customIntervalTicksRef.current * intervalMs);
        customIntervalTicksRef.current += 1;
      }, intervalMs);
    }
  }, [onTick, onInterval, getTime, intervalMs]);

  const stopStopwatch = useCallback(() => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
    }
    if (customIntervalRef.current) {
      clearInterval(customIntervalRef.current);
    }
    tickIntervalRef.current = null;
    customIntervalRef.current = null;
  }, []);

  const resetStopwatch = useCallback(() => {
    stopStopwatch();
    startRef.current = null;
    customIntervalTicksRef.current = 1;
    if (onTick) onTick(0);
  }, [stopStopwatch, onTick]);

  return {startStopwatch, stopStopwatch, resetStopwatch, getTime};
};

export default useStopwatch;
