import { useRef, useCallback } from 'react';

const useTimer = () => {
  const startTimeRef = useRef<number | null>(null);
  const elapsedTimeRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now() - elapsedTimeRef.current;
      timerRef.current = setInterval(() => {
        elapsedTimeRef.current = Date.now() - startTimeRef.current!;
      }, 1000);
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    elapsedTimeRef.current = 0;
    startTimeRef.current = null;
  }, [stopTimer]);

  const getTime = useCallback(() => {
    if (!startTimeRef.current) return elapsedTimeRef.current;
    return Date.now() - startTimeRef.current;
  }, []);

  return { startTimer, stopTimer, resetTimer, getTime };
};

export default useTimer;