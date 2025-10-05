"use client";

import {useGameState} from "@/features/game/state/GameStateContext";
import {GameStatus} from "@/features/game/types/game-state";
import {calculateAccuracy, calculateWPM, humanizeTime} from "@/features/game/utils/typing-metrics";

interface IEndgameViewProps {
  totalTime: number;
  handleRestartGame: () => void;
}

function EndgameView(props: IEndgameViewProps) {
  const {totalTime, handleRestartGame} = props;

  const {state} = useGameState();

  if (state.status !== GameStatus.FINISHED) {
    throw new Error("EndgameView: Received invalid game status");
  }

  const validKeystrokes = state.validKeystrokes;

  const wrongKeystrokes = state.wrongKeystrokes;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row gap-4">
        <div className="bg-slate-500 rounded-lg px-8 py-4 text-white shadow-lg">WPM {calculateWPM(totalTime, state.currentSnippet.text.length)}</div>
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
