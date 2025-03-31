"use client";

import {useGameState} from "@/contexts/GameStateContext";
import {calculateAccuracy, calculateWPM, humanizeTime} from "@/utils/game";

interface IEndgameViewProps {
  totalTime: number;
  handleRestartGame: () => void;
}

function EndgameView(props: IEndgameViewProps) {
  const {totalTime, handleRestartGame} = props;

  const {state} = useGameState();

  const validKeystrokes = state.validKeystrokes;

  const wrongKeystrokes = state.wrongKeystrokes;

  if (!state.snippet) return <div>Loading..</div>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row gap-4">
        <div className="bg-slate-500 rounded-lg px-8 py-4 text-white shadow-lg">WPM {calculateWPM(totalTime, state.snippet.text.length)}</div>
        <div className="bg-slate-500 rounded-lg px-8 py-4 text-white shadow-lg">Accuracy: {calculateAccuracy(validKeystrokes, wrongKeystrokes)}%</div>
        <div className="bg-slate-500 rounded-lg px-8 py-4 text-white shadow-lg">{humanizeTime(totalTime)}</div>
      </div>

      <button className="px-6 py-3 bg-slate-200 text-slate-900 font-medium rounded-md hover:bg-slate-300 disabled:opacity-20" onClick={handleRestartGame}>
        Restart
      </button>
    </div>
  );
}

export default EndgameView;
