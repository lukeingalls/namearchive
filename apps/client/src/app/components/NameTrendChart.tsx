import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useIsMobile } from "./ui/use-mobile";

interface NameTrendChartProps {
  data: { year: number; count: number; percentage: number }[];
  name: string;
}

export function NameTrendChart({ data, name }: NameTrendChartProps) {
  const isMobile = useIsMobile();

  return (
    <div className="w-full h-[320px] sm:h-[420px] md:h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={isMobile ? { top: 8, right: 10, left: 0, bottom: 0 } : { top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#d4b896" opacity={0.3} />
          <XAxis
            dataKey="year"
            stroke="#8b7355"
            tick={{ fill: "#8b7355", fontSize: isMobile ? 11 : 14 }}
            ticks={isMobile ? [1900, 1960, 2026] : [1900, 1930, 1960, 1990, 2026]}
            minTickGap={isMobile ? 24 : 12}
            domain={[1900, 2026]}
          />
          <YAxis
            stroke="#8b7355"
            tick={{ fill: "#8b7355", fontSize: isMobile ? 11 : 14 }}
            domain={[0, 100]}
            width={isMobile ? 34 : 60}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#f5f1e8",
              border: "1px solid #d4b896",
              borderRadius: "4px",
              padding: isMobile ? "8px" : "12px",
              fontSize: isMobile ? "12px" : "14px",
            }}
            labelStyle={{ color: "#4a3f2f", fontWeight: 600 }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Popularity']}
          />
          <Line
            type="monotone"
            dataKey="percentage"
            stroke="#8b6914"
            strokeWidth={isMobile ? 2 : 3}
            dot={false}
            activeDot={{ r: isMobile ? 4 : 6, fill: "#8b6914" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
