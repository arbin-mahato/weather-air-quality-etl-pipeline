import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Thermometer, Flame, Snowflake, TrendingUp } from "lucide-react";
import { useWeatherData } from "../hooks/useWeatherData";
import ChartCard from "../components/ChartCard";
import ChartTooltip from "../components/ChartTooltip";
import KPICard from "../components/KPICard";

const axisStyle = { fill: "var(--chart-axis)", fontSize: 11 };
const gridProps = { stroke: "var(--chart-grid)", strokeDasharray: "3 3" };

// Heat calendar color by temperature
function tempColor(t) {
  if (t < 22) return "#38bdf8";
  if (t < 24) return "#86efac";
  if (t < 26) return "#fde68a";
  if (t < 28) return "#fb923c";
  if (t < 30) return "#ef4444";
  return "#dc2626";
}

export default function TemperaturePage() {
  const { data, stats, monthly, tempDist: dist } = useWeatherData();
  const fmt = (d) => format(new Date(d), "MMM d");
  const fmtLong = (d) => format(new Date(d), "MMM d, yyyy");
  const sorted = [...data].sort((a, b) => b.temperature - a.temperature);
  const hottest = sorted.slice(0, 5);
  const coldest = sorted.slice(-5).reverse();
  return (
    <div className="space-y-5 pb-4">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Avg Temperature"
          value={stats.avgTemp}
          unit="°C"
          sub="Summer average"
          color="#f97316"
          icon={<Thermometer size={20} />}
          delay={0}
          decimals={1}
        />
        <KPICard
          label="Peak Temp"
          value={stats.maxTemp}
          unit="°C"
          sub={fmtLong(stats.maxTempDay)}
          color="#ef4444"
          icon={<Flame size={20} />}
          delay={0.07}
          decimals={1}
        />
        <KPICard
          label="Lowest Temp"
          value={stats.minTemp}
          unit="°C"
          sub={fmtLong(stats.minTempDay)}
          color="#38bdf8"
          icon={<Snowflake size={20} />}
          delay={0.14}
          decimals={1}
        />
        <KPICard
          label="Temp Range"
          value={+(stats.maxTemp - stats.minTemp).toFixed(1)}
          unit="°C"
          sub="Max − Min spread"
          color="#a855f7"
          icon={<TrendingUp size={20} />}
          delay={0.21}
          decimals={1}
        />
      </div>

      {/* Full timeline */}
      <ChartCard
        title="Temperature Timeline"
        subtitle="Daily actual vs. feels-like temperature across the summer (°C)"
        legend={[
          { color: "#f97316", label: "Temperature" },
          { color: "#fbbf24", label: "Feels Like", dashed: true },
        ]}
        delay={0.1}
      >
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={data}
            margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.32} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis
              dataKey="date"
              tickFormatter={fmt}
              tick={axisStyle}
              axisLine={{ stroke: "var(--chart-axis-line)" }}
              tickLine={false}
              interval={5}
            />
            <YAxis
              tickFormatter={(v) => `${v}°`}
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              domain={[18, 33]}
            />
            <Tooltip
              content={
                <ChartTooltip extra={{ temperature: "°C", feels_like: "°C" }} />
              }
            />
            <Area
              type="monotone"
              dataKey="temperature"
              name="Temperature"
              stroke="#f97316"
              strokeWidth={2.5}
              fill="url(#gT)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#f97316",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
            <Area
              type="monotone"
              dataKey="feels_like"
              name="Feels Like"
              stroke="#fbbf24"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              fill="url(#gF)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Monthly avg + Distribution */}
      <div className="grid grid-cols-2 gap-5">
        <ChartCard
          title="Monthly Average Temperature"
          subtitle="Mean daily temperature per month (°C)"
          delay={0.15}
        >
          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={monthly}
              margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid {...gridProps} />
              <XAxis
                dataKey="month"
                tick={axisStyle}
                axisLine={{ stroke: "var(--chart-axis-line)" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${v}°`}
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                domain={[20, 30]}
              />
              <Tooltip
                content={
                  <ChartTooltip
                    isDate={false}
                    extra={{ avgTemp: "°C", maxTemp: "°C", minTemp: "°C" }}
                  />
                }
              />
              <Bar dataKey="avgTemp" name="Avg Temp" radius={[6, 6, 0, 0]}>
                {monthly.map((m, i) => (
                  <Cell
                    key={i}
                    fill={["#f97316", "#ef4444", "#fbbf24", "#fb923c"][i]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Temperature Distribution"
          subtitle="Number of days in each temperature band"
          delay={0.2}
        >
          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={dist}
              margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
              barCategoryGap="20%"
            >
              <CartesianGrid {...gridProps} />
              <XAxis
                dataKey="label"
                tick={axisStyle}
                axisLine={{ stroke: "var(--chart-axis-line)" }}
                tickLine={false}
              />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip
                content={
                  <ChartTooltip isDate={false} extra={{ count: " days" }} />
                }
              />
              <Bar dataKey="count" name="Days" radius={[6, 6, 0, 0]}>
                {dist.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      [
                        "#38bdf8",
                        "#86efac",
                        "#fde68a",
                        "#fb923c",
                        "#ef4444",
                        "#dc2626",
                      ][i]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Heat Calendar */}
      <ChartCard
        title="Temperature Heat Calendar"
        subtitle="Each cell = one day, colored by temperature intensity"
        delay={0.25}
      >
        <div className="flex gap-2 flex-wrap">
          {data.map((d, i) => (
            <motion.div
              key={d.date}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.25 + i * 0.004 }}
              title={`${format(new Date(d.date), "MMM d")}: ${d.temperature}°C`}
              className="rounded cursor-pointer transition-transform hover:scale-125 hover:z-10 relative"
              style={{
                width: 22,
                height: 22,
                background: tempColor(d.temperature),
                opacity: 0.85,
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          {[
            ["<22°", "#38bdf8"],
            ["22-24°", "#86efac"],
            ["24-26°", "#fde68a"],
            ["26-28°", "#fb923c"],
            ["28-30°", "#ef4444"],
            [">30°", "#dc2626"],
          ].map(([l, c]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: c }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {l}
              </span>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Hottest / Coldest days */}
      <div className="grid grid-cols-2 gap-5">
        {[
          { title: "Top 5 Hottest Days", rows: hottest, color: "#ef4444" },
          { title: "Top 5 Coldest Days", rows: coldest, color: "#38bdf8" },
        ].map(({ title, rows, color }) => (
          <ChartCard key={title} title={title} delay={0.3}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    {["Date", "Temp", "Feels Like", "Humidity", "Wind"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left pb-2 pr-4 font-semibold uppercase tracking-wider"
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.65rem",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d, i) => (
                    <tr
                      key={d.date}
                      className="border-t"
                      style={{ borderColor: "var(--separator-color)" }}
                    >
                      <td
                        className="py-2 pr-4 font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {format(new Date(d.date), "MMM d")}
                      </td>
                      <td className="py-2 pr-4 font-bold" style={{ color }}>
                        {d.temperature}°C
                      </td>
                      <td
                        className="py-2 pr-4"
                        style={{ color: "var(--chart-axis)" }}
                      >
                        {d.feels_like}°C
                      </td>
                      <td className="py-2 pr-4" style={{ color: "#06b6d4" }}>
                        {d.humidity}%
                      </td>
                      <td className="py-2" style={{ color: "#10b981" }}>
                        {d.wind_speed} km/h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        ))}
      </div>
    </div>
  );
}
