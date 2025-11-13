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
        <div className="rounded-lg bg-(--color-surface) px-8 py-4 text-(--foreground)">WPM {lastSample.wpm}</div>
        <div className="rounded-lg bg-(--color-surface) px-8 py-4 text-(--foreground)">Accuracy: {calculateAccuracy(validKeystrokes, wrongKeystrokes)}%</div>
        <div className="rounded-lg bg-(--color-surface) px-8 py-4 text-(--foreground)">{lastSample.time}</div>
      </div>

      <div className="flex justify-center [&_*:focus]:outline-none">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={wpmSamples}>
            <XAxis dataKey="time" />
            <YAxis width={30} />
            <Tooltip />
            <Line type="monotone" dataKey="wpm" stroke="var(--color-chart)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-row justify-center gap-4">
        <button
          className="flex-1 rounded-md bg-(--color-accent) px-6 py-3 font-medium text-(--color-accent-contrast) shadow-sm hover:bg-(--color-accent-hover) disabled:opacity-20"
          onClick={handleRetrySnippet}
        >
          Retry snippet
        </button>
        <button
          className="flex-1 rounded-md bg-(--color-accent) px-6 py-3 font-medium text-(--color-accent-contrast) shadow-sm hover:bg-(--color-accent-hover) disabled:opacity-20"
          onClick={handleChangeSnippet}
        >
          Change snippet
        </button>
      </div>
    </div>
  );
}

export default EndgameView;
