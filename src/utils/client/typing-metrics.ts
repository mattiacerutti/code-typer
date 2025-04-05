export function calculateWPM(milliseconds: number, totalCharacters: number) {
  const minutes = milliseconds / 1000 / 60;
  const wpm = totalCharacters / 5 / minutes;
  return Math.round(wpm);
}

export function calculateAccuracy(validKeystrokes: number, wrongKeystrokes: number) {
  const accuracy = (validKeystrokes / (validKeystrokes + wrongKeystrokes)) * 100;
  return Math.round(accuracy);
}

export function humanizeTime(milliseconds: number) {
  const seconds = (milliseconds / 1000).toFixed(1);
  return `${seconds}s`;
}
