import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DayResponse } from "@/App";

interface Props {
  pastResponses: DayResponse[];
}

export function CumulativeGraph({ pastResponses }: Props) {
  const failCounts: Record<number, number> = {};

  pastResponses.forEach((resp) =>
    resp.answers.forEach(({ questionNumber, answer }) => {
      if (!answer) failCounts[questionNumber] = (failCounts[questionNumber] ?? 0) + 1;
    })
  );

  const data = Object.entries(failCounts).map(([q, c]) => ({
    name: `Q${+q + 1}`,
    Fails: c,
  }));

  return (
    <div className="h-[300px] w-full pr-15">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="Fails" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
