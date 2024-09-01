import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";
import { SeismicData } from "../page";

interface SeismicChartProps {
  data: SeismicData[];
}

export function SeismicChart({ data }: SeismicChartProps) {
  const { theme } = useTheme();

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <XAxis
            dataKey="timestamp"
            stroke={theme === "dark" ? "#888" : "#333"}
            tickFormatter={(value) => {
              const date = new Date(value);
              // HH:mm:ss
              return date.toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });
            }}
            dy={10}
            interval={200}
          />
          <YAxis unit="gal" stroke={theme === "dark" ? "#888" : "#333"} />
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme === "dark" ? "#888" : "#333"}
          />
          <Line
            type="monotone"
            dataKey="acceleration.x"
            stroke="#ef4444"
            dot={false}
            name="X軸"
          />
          <Line
            type="monotone"
            dataKey="acceleration.y"
            stroke="#a855f7"
            dot={false}
            name="Y軸"
          />
          <Line
            type="monotone"
            dataKey="acceleration.z"
            stroke="#eab308"
            dot={false}
            name="Z軸"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
