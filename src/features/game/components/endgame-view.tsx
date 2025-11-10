import {calculateAccuracy, calculateWPM, humanizeTime, normalizePositionSamples} from "@/features/game/utils/typing-metrics";
import {useGameStore} from "@/features/game/state/game-store";
import {LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer} from "recharts";

interface IEndgameViewProps {
  handleRetrySnippet: () => void;
  handleChangeSnippet: () => void;
}

function EndgameView(props: IEndgameViewProps) {
  const {handleRetrySnippet, handleChangeSnippet} = props;

  const currentSnippet = useGameStore((state) => state.currentSnippet)!;
  const {validKeystrokes, wrongKeystrokes, positionSamples} = useGameStore.getState().getSessionStats();

  const normalizedPositionSamples = normalizePositionSamples(positionSamples, currentSnippet.parsedSnippet);
  const wpmSamples = normalizedPositionSamples.map((sample) => ({
    time: humanizeTime(sample.time),
    wpm: calculateWPM(sample.time, sample.position),
  }));

  const lastSample = wpmSamples.at(-1)!;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row gap-4">
        <div className="rounded-lg bg-slate-500 px-8 py-4 text-white shadow-lg">WPM {lastSample.wpm}</div>
        <div className="rounded-lg bg-slate-500 px-8 py-4 text-white shadow-lg">Accuracy: {calculateAccuracy(validKeystrokes, wrongKeystrokes)}%</div>
        <div className="rounded-lg bg-slate-500 px-8 py-4 text-white shadow-lg">{lastSample.time}</div>
      </div>

      <div className="flex justify-center [&_*:focus]:outline-none">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={wpmSamples}>
            <XAxis dataKey="time" />
            <YAxis width={30} />
            <Tooltip />
            <Line type="monotone" dataKey="wpm" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
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
