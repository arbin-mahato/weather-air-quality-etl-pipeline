import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ComposedChart,
  Bar,
} from "recharts";
import { format } from "date-fns";
import {
  Thermometer,
  Flame,
  Snowflake,
  CloudRain,
  Wind,
  Sun,
  CloudLightning,
  Calendar,
} from "lucide-react";
import { useWeatherData } from "../hooks/useWeatherData";
import { weatherData, getOverallStats } from "../data/weatherData";
import KPICard from "../components/KPICard";
import ChartCard from "../components/ChartCard";
import InsightCard from "../components/InsightCard";
import ChartTooltip from "../components/ChartTooltip";

const fmt = (d) => format(new Date(d), "MMM d");
const fmtLong = (d) => format(new Date(d), "MMM d, yyyy");

const GradientDefs = () => (
  <defs>
    <linearGradient id="gTemp" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="gFeels" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.15} />
      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="gHumid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="gWind" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
    </linearGradient>
  </defs>
);

const axisStyle = { fill: "var(--chart-axis)", fontSize: 11 };
const gridProps = { stroke: "var(--chart-grid)", strokeDasharray: "3 3" };

export default function Overview() {
  const { data, stats, city } = useWeatherData();

  const dryStreak = (() => {
    let max = 0,
      cur = 0,
      startIdx = 0,
      bestStart = 0;
    data.forEach((d, i) => {
      if (d.precipitation === 0) {
        if (cur === 0) startIdx = i;
        cur++;
        if (cur > max) {
          max = cur;
          bestStart = startIdx;
        }
      } else cur = 0;
    });
    return {
      days: max,
      from: data[bestStart]?.date,
      to: data[Math.min(bestStart + max - 1, data.length - 1)]?.date,
    };
  })();
  const hotDryDays = data.filter(
    (d) => d.temperature > 28 && d.humidity < 50,
  ).length;

  return (
    <div className="space-y-5 pb-4">
      {/* Welcome banner */}
      <div
        className="glass rounded-2xl px-6 py-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(56,189,248,0.07), rgba(167,139,250,0.05))",
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <Sun size={18} className="text-amber-400" /> {city} Summer 2024
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              92-day meteorological analysis · VisualCrossing Weather API
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <span
              className="tag"
              style={{
                background: "rgba(249,115,22,0.12)",
                border: "1px solid rgba(249,115,22,0.25)",
                color: "#f97316",
              }}
            >
              <Thermometer size={12} /> Avg {stats.avgTemp}°C
            </span>
            <span
              className="tag"
              style={{
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.25)",
                color: "#10b981",
              }}
            >
              <Calendar size={12} /> {stats.totalDays} days
            </span>
            <span
              className="tag"
              style={{
                background: "rgba(167,139,250,0.12)",
                border: "1px solid rgba(167,139,250,0.25)",
                color: "#a855f7",
              }}
            >
              <CloudRain size={12} /> {stats.rainyDays} rainy days
            </span>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div
        className="grid grid-cols-5 gap-4"
        style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
      >
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
          label="Rainy Days"
          value={stats.rainyDays}
          unit=""
          sub={`${stats.totalPrecip} mm total`}
          color="#a855f7"
          icon={<CloudRain size={20} />}
          delay={0.21}
          decimals={0}
        />
        <KPICard
          label="Avg Wind"
          value={stats.avgWind}
          unit=" km/h"
          sub={`Peak ${stats.maxWind} km/h`}
          color="#10b981"
          icon={<Wind size={20} />}
          delay={0.28}
          decimals={1}
        />
      </div>

      {/* Temperature timeline */}
      <ChartCard
        title="Temperature Timeline"
        subtitle="Daily actual vs. feels-like temperature (°C)"
        legend={[
          { color: "#f97316", label: "Temperature" },
          { color: "#fbbf24", label: "Feels Like", dashed: true },
        ]}
        delay={0.1}
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={data}
            margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
          >
            <GradientDefs />
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
              fill="url(#gTemp)"
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
              fill="url(#gFeels)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "#fbbf24",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Precipitation + Wind row */}
      <div className="grid grid-cols-2 gap-5">
        <ChartCard
          title="Precipitation & Humidity"
          subtitle="Daily rainfall (mm) + relative humidity (%)"
          legend={[
            { color: "#a855f7", label: "Precipitation" },
            { color: "#06b6d4", label: "Humidity" },
          ]}
          delay={0.15}
        >
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart
              data={data}
              margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gHumid2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
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
                interval={8}
              />
              <YAxis
                yAxisId="p"
                orientation="left"
                tick={{ ...axisStyle, fill: "#a855f7" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}mm`}
              />
              <YAxis
                yAxisId="h"
                orientation="right"
                tick={{ ...axisStyle, fill: "#06b6d4" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                domain={[20, 100]}
              />
              <Tooltip
                content={
                  <ChartTooltip
                    extra={{ precipitation: " mm", humidity: "%" }}
                  />
                }
              />
              <Bar
                yAxisId="p"
                dataKey="precipitation"
                name="Precipitation"
                fill="rgba(168,85,247,0.6)"
                radius={[2, 2, 0, 0]}
              />
              <Area
                yAxisId="h"
                type="monotone"
                dataKey="humidity"
                name="Humidity"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#gHumid2)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#06b6d4",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Wind Speed"
          subtitle="Daily average wind speed (km/h)"
          legend={[{ color: "#10b981", label: "Wind Speed" }]}
          delay={0.2}
        >
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart
              data={data}
              margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
            >
              <GradientDefs />
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
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                content={<ChartTooltip extra={{ wind_speed: " km/h" }} />}
              />
              <Area
                type="monotone"
                dataKey="wind_speed"
                name="Wind"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#gWind)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#10b981",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-3 gap-4">
        <InsightCard
          icon={<CloudLightning size={22} />}
          title="Wettest Single Day"
          color="#a855f7"
          delay={0.25}
        >
          <strong style={{ color: "var(--text-primary)" }}>
            {stats.maxPrecip} mm
          </strong>{" "}
          of rain on{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {fmtLong(stats.maxPrecipDay)}
          </strong>{" "}
          — the summer's heaviest single-day downpour.
        </InsightCard>
        <InsightCard
          icon={<Sun size={22} />}
          title={`${dryStreak.days}-Day Dry Streak`}
          color="#f59e0b"
          delay={0.3}
        >
          Longest rain-free run:{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {fmt(dryStreak.from)}
          </strong>{" "}
          →{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {fmt(dryStreak.to)}
          </strong>{" "}
          with zero precipitation.
        </InsightCard>
        <InsightCard
          icon={<Flame size={22} />}
          title="Hot & Dry Days"
          color="#f97316"
          delay={0.35}
        >
          <strong style={{ color: "var(--text-primary)" }}>
            {hotDryDays} days
          </strong>{" "}
          above 28°C with humidity below 50% — classic Mediterranean summer
          heat. Avg humidity:{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {stats.avgHumidity}%
          </strong>
          .
        </InsightCard>
      </div>
    </div>
  );
}
