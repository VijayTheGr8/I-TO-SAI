import type { DayResponse } from "@/App";
import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  pastResponses: DayResponse[]; 
}

export const CumulativeGraph = ({ pastResponses }: Props) => {
  const [windowSize, setWindowSize] = useState(1);

  const dailyScores = useMemo(
    () =>
      pastResponses.map((resp) =>
        resp.answers.reduce((sum, { answer }) => sum + (answer ? 1 : 0), 0)
      ),
    [pastResponses]
  );

  const data = useMemo(() => {
    const chunks: { name: string; Score: number }[] = [];
    for (let i = 0; i < dailyScores.length; i += windowSize) {
      const slice = dailyScores.slice(i, i + windowSize);
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
      const startDay = i + 1;
      const endDay = Math.min(i + windowSize, dailyScores.length);
      const label =
        windowSize > 1 ? `Days ${startDay}–${endDay}` : `Day ${startDay}`;
      chunks.push({ name: label, Score: avg });
    }
    return chunks;
  }, [dailyScores, windowSize]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <label htmlFor="window" className="font-medium">
          Group size:
        </label>
        <input
          id="window"
          type="number"
          min={1}
          max={pastResponses.length}
          value={windowSize}
          onChange={(e) => {
            let v = parseInt(e.currentTarget.value, 10) || 1;
            v = Math.max(1, Math.min(v, pastResponses.length));
            setWindowSize(v);
          }}
          className="w-16 px-2 py-1 border rounded"
        />
        <span>day{windowSize > 1 ? "s" : ""} per bar</span>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} domain={[0, 9]} />
            <Tooltip
              formatter={(value: number) => value.toFixed(2)}
              labelFormatter={(label) => label}
            />
            <Bar fill="#fb923c" dataKey="Score" name={`Avg (${windowSize})`} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
