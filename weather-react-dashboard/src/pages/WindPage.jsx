import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ZAxis,
} from "recharts";
import { format } from "date-fns";
import { Wind, Gauge, Leaf, Zap, Thermometer } from "lucide-react";
import { useWeatherData } from "../hooks/useWeatherData";
import KPICard from "../components/KPICard";
import ChartCard from "../components/ChartCard";
import ChartTooltip from "../components/ChartTooltip";

const axisStyle = { fill: "var(--chart-axis)", fontSize: 11 };
const gridProps = { stroke: "var(--chart-grid)", strokeDasharray: "3 3" };

export default function WindPage() {
  const { data, stats, monthly, windDist: dist } = useWeatherData();
  const fmt = (d) => format(new Date(d), "MMM d");
  const fmtLong = (d) => format(new Date(d), "MMM d, yyyy");
  const calmDays = data.filter((d) => d.wind_speed < 15).length;
  const windyDays = data.filter((d) => d.wind_speed >= 25).length;
  const minWind = Math.min(...data.map((d) => d.wind_speed));
  const minWindDay = data.find((d) => d.wind_speed === minWind) ?? data[0];
  const scatterData = data.map((d) => ({
    temp: d.temperature,
    wind: d.wind_speed,
    date: d.date,
  }));
  return (
    <div className="space-y-5 pb-4">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Avg Wind Speed"
          value={stats.avgWind}
          unit=" km/h"
          sub="Summer average"
          color="#10b981"
          icon={<Wind size={20} />}
          delay={0}
          decimals={1}
        />
        <KPICard
          label="Maximum Wind"
          value={stats.maxWind}
          unit=" km/h"
          sub={fmtLong(stats.maxWindDay)}
          color="#f97316"
          icon={<Gauge size={20} />}
          delay={0.07}
          decimals={1}
        />
        <KPICard
          label="Minimum Wind"
          value={minWind}
          unit=" km/h"
          sub={fmtLong(minWindDay.date)}
          color="#38bdf8"
          icon={<Leaf size={20} />}
          delay={0.14}
          decimals={1}
        />
        <KPICard
          label="Strong Wind Days"
          value={windyDays}
          unit=""
          sub="Days ≥ 25 km/h"
          color="#fbbf24"
          icon={<Zap size={20} />}
          delay={0.21}
          decimals={0}
        />
      </div>

      {/* Full wind timeline */}
      <ChartCard
        title="Wind Speed Timeline"
        subtitle="Daily average wind speed across the summer (km/h)"
        legend={[{ color: "#10b981", label: "Wind Speed" }]}
        delay={0.1}
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={data}
            margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gW" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
              name="Wind Speed"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#gW)"
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

      {/* Distribution + Scatter row */}
      <div className="grid grid-cols-2 gap-5">
        <ChartCard
          title="Wind Speed Distribution"
          subtitle="Days per wind speed band (km/h)"
          delay={0.15}
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
                        "#34d399",
                        "#10b981",
                        "#fbbf24",
                        "#fb923c",
                        "#ef4444",
                      ][i]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Wind vs Temperature"
          subtitle="Scatter of wind speed vs temperature — hover to see dates"
          delay={0.2}
        >
          <ResponsiveContainer width="100%" height={230}>
            <ScatterChart margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis
                dataKey="temp"
                name="Temperature"
                tickFormatter={(v) => `${v}°`}
                tick={axisStyle}
                axisLine={{ stroke: "var(--chart-axis-line)" }}
                tickLine={false}
                type="number"
                domain={[18, 32]}
              />
              <YAxis
                dataKey="wind"
                name="Wind"
                tickFormatter={(v) => `${v}`}
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
              />
              <ZAxis range={[30, 30]} />
              <Tooltip
                cursor={{
                  strokeDasharray: "3 3",
                  stroke: "var(--chart-grid)",
                }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="tooltip-glass">
                      <p
                        className="text-xs font-semibold mb-1.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {format(new Date(d.date), "MMM d, yyyy")}
                      </p>
                      <div
                        className="flex items-center gap-2 text-xs"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <Thermometer size={11} style={{ color: "#f97316" }} />
                        <span>{d.temp}°C</span>
                        <span style={{ color: "var(--text-secondary)" }}>
                          ·
                        </span>
                        <Wind size={11} style={{ color: "#10b981" }} />
                        <span>{d.wind} km/h</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Scatter data={scatterData} fill="rgba(16,185,129,0.65)" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Monthly wind summary */}
      <div className="grid grid-cols-2 gap-5">
        <ChartCard
          title="Monthly Average Wind"
          subtitle="Average and maximum wind speed per month"
          delay={0.25}
        >
          <ResponsiveContainer width="100%" height={215}>
            <BarChart
              data={monthly}
              margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
              barCategoryGap="25%"
            >
              <CartesianGrid {...gridProps} />
              <XAxis
                dataKey="month"
                tick={axisStyle}
                axisLine={{ stroke: "var(--chart-axis-line)" }}
                tickLine={false}
              />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip
                content={
                  <ChartTooltip
                    isDate={false}
                    extra={{ avgWind: " km/h", maxWind: " km/h" }}
                  />
                }
              />
              <Bar
                dataKey="avgWind"
                name="Avg Wind"
                fill="rgba(16,185,129,0.7)"
                radius={[5, 5, 0, 0]}
              />
              <Bar
                dataKey="maxWind"
                name="Max Wind"
                fill="rgba(251,191,36,0.6)"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Wind stats summary */}
        <ChartCard title="Wind Conditions Summary" delay={0.3}>
          <div className="space-y-3 pt-1">
            {[
              {
                label: "Calm days (< 15 km/h)",
                value: calmDays,
                color: "#38bdf8",
                pct: Math.round((calmDays / data.length) * 100),
              },
              {
                label: "Moderate (15–25 km/h)",
                value: data.length - calmDays - windyDays,
                color: "#10b981",
                pct: Math.round(
                  ((data.length - calmDays - windyDays) / data.length) * 100,
                ),
              },
              {
                label: "Strong days (≥ 25 km/h)",
                value: windyDays,
                color: "#f97316",
                pct: Math.round((windyDays / data.length) * 100),
              },
            ].map(({ label, value, color, pct }) => (
              <div key={label}>
                <div className="flex justify-between mb-1">
                  <span
                    className="text-xs"
                    style={{ color: "var(--chart-axis)" }}
                  >
                    {label}
                  </span>
                  <span className="text-xs font-bold" style={{ color }}>
                    {value} days · {pct}%
                  </span>
                </div>
                <div
                  className="w-full rounded-full h-1.5"
                  style={{ background: "var(--wind-bar-track)" }}
                >
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
