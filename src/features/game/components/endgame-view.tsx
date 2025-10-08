import {calculateAccuracy, calculateWPM, humanizeTime} from "@/features/game/utils/typing-metrics";
import {useGameStore} from "@/features/game/state/game-store";

interface IEndgameViewProps {
  totalTime: number;
  handleRetrySnippet: () => void;
  handleChangeSnippet: () => void;
}

function EndgameView(props: IEndgameViewProps) {
  const {totalTime, handleRetrySnippet, handleChangeSnippet} = props;

  const currentSnippet = useGameStore((state) => state.currentSnippet)!;
  const validKeystrokes = useGameStore((state) => state.validKeystrokes);
  const wrongKeystrokes = useGameStore((state) => state.wrongKeystrokes);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row gap-4">
        <div className="rounded-lg bg-slate-500 px-8 py-4 text-white shadow-lg">WPM {calculateWPM(totalTime, currentSnippet.text.length)}</div>
        <div className="rounded-lg bg-slate-500 px-8 py-4 text-white shadow-lg">Accuracy: {calculateAccuracy(validKeystrokes, wrongKeystrokes)}%</div>
        <div className="rounded-lg bg-slate-500 px-8 py-4 text-white shadow-lg">{humanizeTime(totalTime)}</div>
      </div>

      <div className="flex flex-row justify-center gap-4">
        <button className="flex-1 rounded-md bg-slate-200 px-6 py-3 font-medium text-slate-900 hover:bg-slate-300 disabled:opacity-20" onClick={handleRetrySnippet}>
          Retry snippet
        </button>
        <button className="flex-1 rounded-md bg-slate-200 px-6 py-3 font-medium text-slate-900 hover:bg-slate-300 disabled:opacity-20" onClick={handleChangeSnippet}>
          Change snippet
        </button>
      </div>
    </div>
  );
}

export default EndgameView;
