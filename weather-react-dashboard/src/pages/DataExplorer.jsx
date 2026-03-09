import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { useWeatherData } from "../hooks/useWeatherData";

const PAGE_SIZE = 20;

const COLUMNS = [
  {
    key: "date",
    label: "Date",
    fmt: (d) => format(new Date(d), "MMM d, yyyy"),
  },
  {
    key: "temperature",
    label: "Temp (°C)",
    fmt: (v) => `${v}°C`,
    color: "#f97316",
  },
  {
    key: "feels_like",
    label: "Feels Like",
    fmt: (v) => `${v}°C`,
    color: "#fbbf24",
  },
  { key: "humidity", label: "Humidity", fmt: (v) => `${v}%`, color: "#06b6d4" },
  {
    key: "precipitation",
    label: "Rain (mm)",
    fmt: (v) => `${v} mm`,
    color: "#a855f7",
  },
  {
    key: "wind_speed",
    label: "Wind (km/h)",
    fmt: (v) => `${v} km/h`,
    color: "#10b981",
  },
];

function SortIcon({ col, sortKey, sortDir }) {
  if (sortKey !== col) return <ChevronUp size={12} className="opacity-20" />;
  return sortDir === "asc" ? (
    <ChevronUp size={12} style={{ color: "#38bdf8" }} />
  ) : (
    <ChevronDown size={12} style={{ color: "#38bdf8" }} />
  );
}

export default function DataExplorer() {
  const { data } = useWeatherData();
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("all");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let rows = data;
    if (month !== "all") rows = rows.filter((d) => d.date.startsWith(month));
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (d) =>
          d.date.toLowerCase().includes(q) ||
          format(new Date(d.date), "MMM d yyyy").toLowerCase().includes(q),
      );
    }
    rows = [...rows].sort((a, b) => {
      const va = a[sortKey],
        vb = b[sortKey];
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [search, month, sortKey, sortDir, data]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleExport = () => {
    const headers = COLUMNS.map((c) => c.label);
    const rows = filtered.map((d) => COLUMNS.map((c) => d[c.key]));
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ioannina_weather_summer_2024.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 pb-4">
      {/* Controls bar */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-2xl p-4"
      >
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <input
              className="input-glass pl-8"
              placeholder="Search by date (e.g. Jun 15, Jul, 2024-08)…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          {/* Month filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500" />
            <select
              className="input-glass"
              style={{ width: "auto", paddingRight: "2.5rem" }}
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Months</option>
              <option value="2024-06">June 2024</option>
              <option value="2024-07">July 2024</option>
              <option value="2024-08">August 2024</option>
              <option value="2024-09">September 2024</option>
            </select>
          </div>
          {/* Stats */}
          <div
            className="text-xs px-3 py-2 rounded-lg"
            style={{ background: "rgba(255,255,255,0.05)", color: "#64748b" }}
          >
            Showing{" "}
            <span className="font-bold text-white">{filtered.length}</span> of{" "}
            <span className="font-bold text-white">92</span> records
          </div>
          {/* Export */}
          <button className="btn-primary ml-auto" onClick={handleExport}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="text-left px-5 py-3.5 cursor-pointer select-none"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{
                          color: sortKey === col.key ? "#38bdf8" : "#475569",
                        }}
                      >
                        {col.label}
                      </span>
                      <SortIcon
                        col={col.key}
                        sortKey={sortKey}
                        sortDir={sortDir}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {paged.map((d, i) => (
                  <motion.tr
                    key={d.date}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.018 }}
                    className="group"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                  >
                    {COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className="px-5 py-3 text-sm transition-colors duration-150 group-hover:bg-white/[0.025]"
                        style={{
                          color: col.color ?? "#e2e8f0",
                          fontWeight: col.key === "date" ? 600 : 400,
                        }}
                      >
                        {col.fmt ? col.fmt(d[col.key]) : d[col.key]}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
              {paged.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm"
                    style={{ color: "#475569" }}
                  >
                    No records match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <span className="text-xs" style={{ color: "#475569" }}>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost py-1 px-2 disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-7 h-7 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background:
                      p === page ? "rgba(56,189,248,0.15)" : "transparent",
                    color: p === page ? "#38bdf8" : "#64748b",
                    border:
                      p === page
                        ? "1px solid rgba(56,189,248,0.3)"
                        : "1px solid transparent",
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-ghost py-1 px-2 disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick stats row */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.18 }}
        className="grid grid-cols-6 gap-3"
      >
        {COLUMNS.filter((c) => c.key !== "date").map((col) => {
          const vals = filtered.map((d) => d[col.key]);
          const mn = vals.length ? Math.min(...vals) : 0;
          const mx = vals.length ? Math.max(...vals) : 0;
          const av = vals.length
            ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
            : 0;
          return (
            <div key={col.key} className="glass rounded-xl p-3 glass-hover">
              <div
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#475569", fontSize: "0.62rem" }}
              >
                {col.label}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "#475569" }}>
                    Avg
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: col.color }}
                  >
                    {av}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "#475569" }}>
                    Min
                  </span>
                  <span className="text-xs font-semibold text-white">{mn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "#475569" }}>
                    Max
                  </span>
                  <span className="text-xs font-semibold text-white">{mx}</span>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
