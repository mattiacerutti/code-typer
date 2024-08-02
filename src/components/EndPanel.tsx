import {useGameState} from "@/contexts/game-state/GameStateContext";
import {calculateAccuracy, calculateWPM, humanizeTime} from "@/utils/game-utils";
import {useMemo} from "react";

interface IEndPanelProps {
  totalTime: number;
  handleRestartGame: () => void;
}

function EndPanel(props: IEndPanelProps) {
  const {totalTime, handleRestartGame} = props;

  const {gameState} = useGameState();

  const validKeystrokes = useMemo(() => {
    return gameState.validKeystrokes;
  }, [gameState.validKeystrokes]);

  const wrongKeystrokes = useMemo(() => {
    return gameState.wrongKeystrokes;
  }, [gameState.wrongKeystrokes]);

  if (!gameState.snippet) return <div>Loading..</div>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row gap-4">
        <div className="bg-slate-500 rounded-lg px-8 py-4 text-white shadow-lg">WPM {calculateWPM(totalTime, gameState.snippet.text.length)}</div>
        <div className="bg-slate-500 rounded-lg px-8 py-4 text-white shadow-lg">Accuracy: {calculateAccuracy(validKeystrokes, wrongKeystrokes)}%</div>
        <div className="bg-slate-500 rounded-lg px-8 py-4 text-white shadow-lg">{humanizeTime(totalTime)}</div>
      </div>

      <button className="px-6 py-3 bg-slate-200 text-slate-900 font-medium rounded-md hover:bg-slate-300 disabled:opacity-20" onClick={handleRestartGame}>
        Restart
      </button>
    </div>
  );
}

export default EndPanel;
