import {calculateAccuracy, calculateWPM, humanizeTime, normalizePositionSamples} from "@/features/game/utils/typing-metrics";
import {useGameStore} from "@/features/game/state/game-store";
import {LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer} from "recharts";

interface IEndgameViewProps {
  handleRetrySnippet: () => void;
  handleChangeSnippet: () => void;
}

function StatCard({label, value, helper}: {label: string; value: string | number; helper?: string}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-black">{value}</p>
      {helper ? <p className="mt-1 text-xs text-zinc-500">{helper}</p> : null}
    </div>
  );
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
    <div className="flex flex-col gap-6 rounded-3xl border border-black/10 bg-white p-6 text-black shadow-sm sm:p-10">
      <div>
        <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Run complete</p>
        <h2 className="mt-2 text-3xl font-semibold">Session report</h2>
        <p className="text-sm text-zinc-500">Review the curve, then continue practicing.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Final WPM" value={lastSample.wpm} helper="Based on last caret sample" />
        <StatCard label="Accuracy" value={`${calculateAccuracy(validKeystrokes, wrongKeystrokes)}%`} helper={`${validKeystrokes} correct · ${wrongKeystrokes} misses`} />
        <StatCard label="Time" value={lastSample.time} helper="Elapsed typing time" />
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-4 [&_*:focus]:outline-none">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={wpmSamples} margin={{top: 10, right: 10, left: -15, bottom: 0}}>
            <XAxis dataKey="time" stroke="#a1a1aa" tick={{fontSize: 12}} dy={10} />
            <YAxis width={35} stroke="#a1a1aa" tick={{fontSize: 12}} dx={-5} />
            <Tooltip contentStyle={{backgroundColor: "#ffffff", border: "1px solid #e4e4e7", borderRadius: 12, color: "#0f172a"}} />
            <Line type="monotone" dataKey="wpm" stroke="#0f172a" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button className="flex-1 rounded-2xl border border-black/10 bg-black px-6 py-3 text-sm font-semibold text-white" onClick={handleRetrySnippet}>
          Retry snippet
        </button>
        <button className="flex-1 rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-black" onClick={handleChangeSnippet}>
          Change snippet
        </button>
      </div>
    </div>
  );
}

export default EndgameView;
