import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Database,
  GitBranch,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Radio,
  Settings2,
  RefreshCw,
  Clock,
  Activity,
  Play,
} from "lucide-react";
import { useWeatherData } from "../hooks/useWeatherData";
import { api } from "../services/api";

const STEPS = [
  {
    icon: <Radio size={22} style={{ color: "#38bdf8" }} />,
    title: "Extract",
    color: "#38bdf8",
    border: "rgba(56,189,248,0.25)",
    bg: "rgba(56,189,248,0.07)",
    file: "src/extract.py",
    desc: "Pulls raw weather data from the VisualCrossing REST API and air quality data from AirVisual.",
    items: [
      {
        ok: true,
        label: "VisualCrossing Weather API",
        note: "92 days · all configured cities",
      },
      {
        ok: false,
        label: "AirVisual Air Quality API",
        note: "Requires paid plan (skipped)",
      },
    ],
  },
  {
    icon: <Settings2 size={22} style={{ color: "#fbbf24" }} />,
    title: "Transform",
    color: "#fbbf24",
    border: "rgba(251,191,36,0.25)",
    bg: "rgba(251,191,36,0.07)",
    file: "src/transform.py",
    desc: "Cleans raw JSON: selects columns, enforces data types, forward-fills gaps, normalises names.",
    items: [
      {
        ok: true,
        label: "Column selection & rename",
        note: "6 analytical fields",
      },
      {
        ok: true,
        label: "Type enforcement",
        note: "pd.to_numeric, pd.to_datetime",
      },
      { ok: true, label: "Missing-value handling", note: "ffill → dropna" },
      {
        ok: true,
        label: "Column name normalisation",
        note: "lowercase + underscores",
      },
    ],
  },
  {
    icon: <Database size={22} style={{ color: "#10b981" }} />,
    title: "Load",
    color: "#10b981",
    border: "rgba(16,185,129,0.25)",
    bg: "rgba(16,185,129,0.07)",
    file: "src/load.py",
    desc: "Upserts the cleaned DataFrame into a PostgreSQL table via SQLAlchemy — INSERT … ON CONFLICT so re-runs never duplicate rows.",
    items: [
      {
        ok: true,
        label: "SQLAlchemy engine",
        note: "psycopg2 · PostgreSQL 14",
      },
      {
        ok: true,
        label: "weather_data table",
        note: "upsert · UNIQUE(city, date)",
      },
      {
        ok: true,
        label: "Multi-city support",
        note: "106 cities · city column",
      },
    ],
  },
];

const TECH = [
  { label: "Python 3.9", color: "#3b82f6" },
  { label: "pandas 2.2", color: "#f59e0b" },
  { label: "SQLAlchemy 2.0", color: "#10b981" },
  { label: "psycopg2", color: "#a855f7" },
  { label: "PostgreSQL", color: "#38bdf8" },
  { label: "requests", color: "#64748b" },
  { label: "python-dotenv", color: "#f97316" },
  { label: "React 18", color: "#61dafb" },
  { label: "Recharts", color: "#ef4444" },
  { label: "Framer Motion", color: "#ec4899" },
  { label: "Tailwind CSS", color: "#38bdf8" },
  { label: "Vite", color: "#bd34fe" },
];

export default function PipelinePage() {
  const { stats, monthly, source, refetch } = useWeatherData();

  const [etl, setEtl] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [trigMsg, setTrigMsg] = useState(null);

  useEffect(() => {
    api
      .etlStatus()
      .then(setEtl)
      .catch(() => {});
    const id = setInterval(
      () =>
        api
          .etlStatus()
          .then(setEtl)
          .catch(() => {}),
      5000,
    );
    return () => clearInterval(id);
  }, []);

  async function handleTrigger() {
    setTriggering(true);
    setTrigMsg(null);
    try {
      const res = await api.etlTrigger();
      setTrigMsg({ ok: true, text: res.message });
      setTimeout(
        () =>
          api
            .etlStatus()
            .then(setEtl)
            .catch(() => {}),
        1200,
      );
      setTimeout(() => refetch(), 3000); // refresh chart data after ETL likely finishes
    } catch (e) {
      setTrigMsg({ ok: false, text: e.message });
    } finally {
      setTriggering(false);
    }
  }

  const statusColor = {
    never: "#475569",
    running: "#fbbf24",
    success: "#10b981",
    partial: "#f97316",
    error: "#ef4444",
  };
  const statusLabel = {
    never: "Never run",
    running: "Running…",
    success: "Success",
    partial: "Partial success",
    error: "Error",
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-2xl px-6 py-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(56,189,248,0.06), rgba(167,139,250,0.05))",
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <GitBranch size={20} className="text-sky-400" />
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Weather &amp; Air Quality ETL Pipeline
          </h2>
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Automated data pipeline that extracts meteorological data from
          external APIs, transforms it into a clean analytical dataset, and
          loads it into PostgreSQL for querying and visualisation.
        </p>
      </motion.div>

      {/* Live ETL Worker Status */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.07 }}
        className="glass rounded-2xl p-5"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Activity size={16} className="text-sky-400" />
            <div>
              <div
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                ETL Worker Status
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Background scheduler · runs every 24 h · data source:{" "}
                <span
                  style={{ color: source === "api" ? "#10b981" : "#fbbf24" }}
                >
                  {source}
                </span>
              </div>
            </div>
          </div>

          {/* Status pill */}
          {etl ? (
            <div className="flex items-center gap-4 flex-wrap">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  background: `${statusColor[etl.status] ?? "#475569"}18`,
                  border: `1px solid ${statusColor[etl.status] ?? "#475569"}30`,
                  color: statusColor[etl.status] ?? "#475569",
                }}
              >
                {etl.status === "running" && (
                  <RefreshCw size={12} className="animate-spin" />
                )}
                {etl.status === "success" && <CheckCircle2 size={12} />}
                {(etl.status === "error" || etl.status === "partial") && (
                  <AlertCircle size={12} />
                )}
                {etl.status === "never" && <Clock size={12} />}
                {statusLabel[etl.status] ?? etl.status}
              </div>

              {/* Per-city progress bar */}
              {etl.status === "running" && etl.cities_total > 0 && (
                <div className="flex items-center gap-2">
                  <div
                    className="rounded-full overflow-hidden"
                    style={{
                      width: 120,
                      height: 6,
                      background: "var(--wind-bar-track)",
                    }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round((etl.cities_done / etl.cities_total) * 100)}%`,
                        background: "linear-gradient(90deg, #38bdf8, #a855f7)",
                        transition: "width .4s ease",
                      }}
                    />
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {etl.cities_done}/{etl.cities_total} cities
                  </span>
                  {etl.current_city && (
                    <span className="text-xs" style={{ color: "#38bdf8" }}>
                      · {etl.current_city}…
                    </span>
                  )}
                </div>
              )}

              {etl.last_run && (
                <div
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span className="text-slate-400 mr-1">Last run:</span>
                  {new Date(etl.last_run).toLocaleString()}
                </div>
              )}
              {etl.rows_loaded > 0 && (
                <div className="text-xs" style={{ color: "#10b981" }}>
                  {etl.rows_loaded} rows loaded
                </div>
              )}
              {etl.next_run && (
                <div
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span className="text-slate-400 mr-1">Next:</span>
                  {new Date(etl.next_run).toLocaleString()}
                </div>
              )}
              {etl.error && (
                <div
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    color: "#ef4444",
                  }}
                >
                  {etl.error}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
              API offline — start Flask backend to see live status
            </div>
          )}

          {/* Trigger button */}
          <button
            onClick={handleTrigger}
            disabled={triggering || etl?.status === "running"}
            className="btn-primary disabled:opacity-40"
          >
            {triggering ? (
              <>
                <RefreshCw size={13} className="animate-spin" /> Triggering…
              </>
            ) : (
              <>
                <Play size={13} /> Run ETL Now
              </>
            )}
          </button>
        </div>

        {trigMsg && (
          <div
            className="mt-3 text-xs px-3 py-2 rounded-lg"
            style={{
              background: trigMsg.ok
                ? "rgba(16,185,129,0.1)"
                : "rgba(239,68,68,0.1)",
              color: trigMsg.ok ? "#10b981" : "#ef4444",
              border: `1px solid ${trigMsg.ok ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
            }}
          >
            {trigMsg.text}
          </div>
        )}
      </motion.div>

      {/* ETL Flow */}
      <div className="flex items-stretch gap-0">
        {STEPS.map((step, idx) => (
          <div key={step.title} className="flex items-center flex-1 gap-0">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 + idx * 0.12 }}
              className="flex-1 rounded-2xl p-5 glass-hover"
              style={{
                background: step.bg,
                border: `1px solid ${step.border}`,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0">{step.icon}</div>
                <div>
                  <div
                    className="font-bold text-base"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {step.title}
                  </div>
                  <div
                    className="text-xs font-mono mt-0.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {step.file}
                  </div>
                </div>
              </div>
              <p
                className="text-xs mb-4 leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                {step.desc}
              </p>
              <div className="space-y-2">
                {step.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {item.ok ? (
                      <CheckCircle2
                        size={13}
                        className="mt-0.5 flex-shrink-0"
                        style={{ color: step.color }}
                      />
                    ) : (
                      <AlertCircle
                        size={13}
                        className="mt-0.5 flex-shrink-0 text-orange-400"
                      />
                    )}
                    <div>
                      <span
                        className="text-xs font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="text-xs ml-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {item.note}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            {idx < STEPS.length - 1 && (
              <div className="px-3 flex-shrink-0 self-center">
                <ArrowRight size={20} style={{ color: "#1e3a5f" }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Data stats */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35 }}
        className="glass rounded-2xl p-5"
      >
        <div className="section-title mb-4 flex items-center gap-2">
          <Database size={13} /> Pipeline Output Statistics
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: "Total Records",
              value: "92",
              note: "Daily observations",
              color: "#38bdf8",
            },
            {
              label: "Columns",
              value: "6",
              note: "After transformation",
              color: "#10b981",
            },
            {
              label: "Date Range",
              value: "93 days",
              note: "Jun 3 – Sep 3, 2024",
              color: "#fbbf24",
            },
            {
              label: "Missing Values",
              value: "0",
              note: "After ffill + dropna",
              color: "#a855f7",
            },
          ].map(({ label, value, note, color }) => (
            <div
              key={label}
              className="glass rounded-xl p-4 glass-hover text-center"
            >
              <div className="font-extrabold text-2xl mb-1" style={{ color }}>
                {value}
              </div>
              <div
                className="text-xs font-semibold mb-0.5"
                style={{ color: "var(--text-primary)" }}
              >
                {label}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {note}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Monthly breakdown stats */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.45 }}
        className="glass rounded-2xl p-5"
      >
        <div className="section-title mb-4">Monthly Data Breakdown</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-surface)" }}>
                {[
                  "Month",
                  "Days",
                  "Avg Temp",
                  "Max Temp",
                  "Min Temp",
                  "Avg Humidity",
                  "Total Rain",
                  "Rainy Days",
                  "Avg Wind",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left py-2 pr-6 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthly.map((m, i) => (
                <tr
                  key={m.month}
                  style={{ borderBottom: "1px solid var(--separator-color)" }}
                  className="group"
                >
                  <td
                    className="py-3 font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {m.month}
                  </td>
                  <td
                    className="py-3 pr-6"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {m.days}
                  </td>
                  <td
                    className="py-3 pr-6 font-semibold"
                    style={{ color: "#f97316" }}
                  >
                    {m.avgTemp}°C
                  </td>
                  <td className="py-3 pr-6" style={{ color: "#ef4444" }}>
                    {m.maxTemp}°C
                  </td>
                  <td className="py-3 pr-6" style={{ color: "#38bdf8" }}>
                    {m.minTemp}°C
                  </td>
                  <td className="py-3 pr-6" style={{ color: "#06b6d4" }}>
                    {m.avgHumidity}%
                  </td>
                  <td className="py-3 pr-6">
                    <span
                      className="tag"
                      style={{
                        background: "rgba(168,85,247,0.12)",
                        border: "1px solid rgba(168,85,247,0.22)",
                        color: "#a855f7",
                      }}
                    >
                      {m.totalPrecip} mm
                    </span>
                  </td>
                  <td
                    className="py-3 pr-6"
                    style={{ color: "var(--chart-axis)" }}
                  >
                    {m.rainyDays}
                  </td>
                  <td className="py-3" style={{ color: "#10b981" }}>
                    {m.avgWind} km/h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Tech stack */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.55 }}
        className="glass rounded-2xl p-5"
      >
        <div className="section-title mb-4 flex items-center gap-2">
          <Zap size={13} /> Technology Stack
        </div>
        <div className="flex flex-wrap gap-2">
          {TECH.map(({ label, color }) => (
            <span
              key={label}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold glass-hover cursor-default"
              style={{
                background: `${color}12`,
                border: `1px solid ${color}28`,
                color,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
