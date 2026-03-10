import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { format } from "date-fns";
import { CloudRain, Umbrella, CloudLightning, Droplets } from "lucide-react";
import { useWeatherData } from "../hooks/useWeatherData";
import KPICard from "../components/KPICard";
import ChartCard from "../components/ChartCard";
import ChartTooltip from "../components/ChartTooltip";

const axisStyle = { fill: "var(--chart-axis)", fontSize: 11 };
const gridProps = { stroke: "var(--chart-grid)", strokeDasharray: "3 3" };
const monthColors = ["#818cf8", "#a855f7", "#7c3aed", "#6d28d9"];

export default function PrecipitationPage() {
  const { data, stats, monthly, cumul } = useWeatherData();
  const fmt = (d) => format(new Date(d), "MMM d");
  const fmtLong = (d) => format(new Date(d), "MMM d, yyyy");
  return (
    <div className="space-y-5 pb-4">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Total Rainfall"
          value={stats.totalPrecip}
          unit=" mm"
          sub="Summer total"
          color="#a855f7"
          icon={<CloudRain size={20} />}
          delay={0}
          decimals={1}
        />
        <KPICard
          label="Rainy Days"
          value={stats.rainyDays}
          unit=""
          sub={`${stats.totalDays - stats.rainyDays} dry days`}
          color="#818cf8"
          icon={<Umbrella size={20} />}
          delay={0.07}
          decimals={0}
        />
        <KPICard
          label="Max Single Day"
          value={stats.maxPrecip}
          unit=" mm"
          sub={fmtLong(stats.maxPrecipDay)}
          color="#ec4899"
          icon={<CloudLightning size={20} />}
          delay={0.14}
          decimals={1}
        />
        <KPICard
          label="Avg Humidity"
          value={stats.avgHumidity}
          unit="%"
          sub="Daily average"
          color="#06b6d4"
          icon={<Droplets size={20} />}
          delay={0.21}
          decimals={1}
        />
      </div>

      {/* Daily precip bars */}
      <ChartCard
        title="Daily Precipitation"
        subtitle="Daily rainfall in millimetres across the summer"
        legend={[{ color: "#a855f7", label: "Precipitation (mm)" }]}
        delay={0.1}
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
          >
            <CartesianGrid {...gridProps} />
            <XAxis
              dataKey="date"
              tickFormatter={fmt}
              tick={axisStyle}
              axisLine={{ stroke: "var(--chart-axis-line)" }}
              tickLine={false}
              interval={6}
            />
            <YAxis
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}mm`}
            />
            <Tooltip
              content={<ChartTooltip extra={{ precipitation: " mm" }} />}
            />
            <Bar
              dataKey="precipitation"
              name="Precipitation"
              fill="rgba(168,85,247,0.7)"
              radius={[3, 3, 0, 0]}
            >
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={
                    d.precipitation > 10
                      ? "#ec4899"
                      : d.precipitation > 2
                        ? "#a855f7"
                        : "rgba(168,85,247,0.5)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Cumulative + Monthly row */}
      <div className="grid grid-cols-2 gap-5">
        <ChartCard
          title="Cumulative Rainfall"
          subtitle="Running total of precipitation over the summer (mm)"
          delay={0.15}
        >
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart
              data={cumul}
              margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gCum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis
                dataKey="date"
                tickFormatter={fmt}
                tick={axisStyle}
                axisLine={{ stroke: "var(--chart-axis-line)" }}
                tickLine={false}
                interval={8}
              />
              <YAxis
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}mm`}
              />
              <Tooltip
                content={<ChartTooltip extra={{ cumulative: " mm total" }} />}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                name="Cumulative"
                stroke="#a855f7"
                strokeWidth={2.5}
                fill="url(#gCum)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#a855f7",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Monthly Rainfall Totals"
          subtitle="Total precipitation per month"
          delay={0.2}
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
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}mm`}
              />
              <Tooltip
                content={
                  <ChartTooltip
                    isDate={false}
                    extra={{ totalPrecip: " mm", rainyDays: " days" }}
                  />
                }
              />
              <Bar
                dataKey="totalPrecip"
                name="Total Rain"
                radius={[6, 6, 0, 0]}
              >
                {monthly.map((_, i) => (
                  <Cell key={i} fill={monthColors[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Humidity timeline */}
      <ChartCard
        title="Humidity Timeline"
        subtitle="Daily relative humidity (%) across the summer"
        legend={[{ color: "#06b6d4", label: "Humidity %" }]}
        delay={0.25}
      >
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={data}
            margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gH" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis
              dataKey="date"
              tickFormatter={fmt}
              tick={axisStyle}
              axisLine={{ stroke: "var(--chart-axis-line)" }}
              tickLine={false}
              interval={6}
            />
            <YAxis
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={[20, 100]}
            />
            <Tooltip content={<ChartTooltip extra={{ humidity: "%" }} />} />
            <Area
              type="monotone"
              dataKey="humidity"
              name="Humidity"
              stroke="#06b6d4"
              strokeWidth={2.5}
              fill="url(#gH)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#06b6d4",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Monthly rainy days summary */}
      <div className="glass rounded-2xl p-5">
        <div className="section-title mb-4">Monthly Precipitation Summary</div>
        <div className="grid grid-cols-4 gap-4">
          {monthly.map((m, i) => (
            <div key={m.month} className="glass rounded-xl p-4 glass-hover">
              <div
                className="text-xs font-bold mb-3"
                style={{ color: monthColors[i] }}
              >
                {m.month}
              </div>
              <div className="space-y-2">
                {[
                  ["Total Rain", `${m.totalPrecip} mm`],
                  ["Rainy Days", `${m.rainyDays} / ${m.days}`],
                  ["Avg Humidity", `${m.avgHumidity}%`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {k}
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
