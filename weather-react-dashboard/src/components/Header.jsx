import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import {
  Calendar,
  Database,
  Wifi,
  WifiOff,
  MapPin,
  Search,
  ChevronDown,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useWeatherContext } from "../contexts/WeatherContext";
import { useTheme } from "../contexts/ThemeContext";

const PAGE_META = {
  "/": { title: "Overview", sub: "Summer 2024 at a glance" },
  "/temperature": { title: "Temperature", sub: "Daily temperature analysis" },
  "/precipitation": {
    title: "Precipitation",
    sub: "Rainfall & humidity patterns",
  },
  "/wind": { title: "Wind", sub: "Wind speed analysis" },
  "/explorer": {
    title: "Data Explorer",
    sub: "Browse, filter & export raw data",
  },
  "/pipeline": { title: "ETL Pipeline", sub: "Extract · Transform · Load" },
};

export default function Header() {
  const { pathname } = useLocation();
  const { source, data, cities, city, setCity } = useWeatherContext();
  const meta = PAGE_META[pathname] ?? { title: "Dashboard", sub: "" };
  const isApi = source === "api";

  const { isDark, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
  const dropRef = useRef(null);
  const btnRef = useRef(null);

  const filtered = cities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Position + open the dropdown
  function openDrop() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
    setOpen((o) => !o);
    setSearch("");
  }

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (
        dropRef.current &&
        !dropRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function selectCity(name) {
    setCity(name);
    setOpen(false);
    setSearch("");
  }

  return (
    <header
      className="flex items-center justify-between px-6 py-4 flex-shrink-0"
      style={{
        borderBottom: "1px solid var(--header-border)",
        background: "var(--header-bg)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div>
        <h1
          className="text-lg font-700 font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {meta.title}
        </h1>
        <p
          className="text-xs mt-0.5"
          style={{ color: "var(--text-secondary)" }}
        >
          {meta.sub}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* City selector */}
        <div className="relative">
          <button
            ref={btnRef}
            onClick={openDrop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: open
                ? "rgba(56,189,248,0.12)"
                : "var(--btn-ghost-bg)",
              border: `1px solid ${open ? "rgba(56,189,248,0.35)" : "var(--btn-ghost-border)"}`,
              color: "var(--text-primary)",
              cursor: "pointer",
              transition: "all .15s",
            }}
          >
            <MapPin size={12} style={{ color: "#38bdf8" }} />
            {city}
            <ChevronDown
              size={11}
              style={{
                color: "#64748b",
                transform: open ? "rotate(180deg)" : "none",
                transition: "transform .2s",
              }}
            />
          </button>

          {open &&
            createPortal(
              <div
                ref={dropRef}
                style={{
                  position: "fixed",
                  top: dropPos.top,
                  right: dropPos.right,
                  width: 280,
                  zIndex: 99999,
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "var(--bg-surface-solid)",
                  border: "1px solid rgba(56,189,248,0.18)",
                  boxShadow:
                    "0 32px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(56,189,248,0.06)",
                }}
              >
                {/* Search input */}
                <div
                  className="flex items-center gap-2.5 px-3 py-2.5 m-2 rounded-xl"
                  style={{
                    background: "var(--stats-pill-bg)",
                    border: "1px solid var(--border-surface)",
                  }}
                >
                  <Search
                    size={13}
                    style={{ color: "#38bdf8", flexShrink: 0 }}
                  />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search city…"
                    className="flex-1 bg-transparent text-xs outline-none"
                    style={{ color: "var(--text-primary)" }}
                  />
                  {search ? (
                    <button
                      onClick={() => setSearch("")}
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: 16,
                        height: 16,
                        background: "var(--btn-ghost-bg)",
                        flexShrink: 0,
                      }}
                    >
                      <X size={9} style={{ color: "var(--text-secondary)" }} />
                    </button>
                  ) : (
                    <span
                      className="rounded px-1 font-mono"
                      style={{
                        background: "var(--btn-ghost-bg)",
                        color: "var(--text-secondary)",
                        fontSize: 9,
                        lineHeight: "16px",
                      }}
                    >
                      /
                    </span>
                  )}
                </div>

                {/* Result count */}
                {search && (
                  <div
                    className="px-3 pb-1 text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                  </div>
                )}

                {/* City list */}
                <div
                  style={{ maxHeight: 272, overflowY: "auto" }}
                  className="px-2 pb-2"
                >
                  {filtered.length === 0 ? (
                    <div
                      className="px-4 py-5 text-xs text-center"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      No cities match&nbsp;
                      <span style={{ color: "var(--text-muted)" }}>
                        "{search}"
                      </span>
                    </div>
                  ) : (
                    filtered.map((c) => {
                      const active = c.name === city;
                      return (
                        <button
                          key={c.name}
                          onClick={() => selectCity(c.name)}
                          className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 rounded-lg"
                          style={{
                            color: active ? "#38bdf8" : "var(--text-tertiary)",
                            background: active
                              ? "rgba(56,189,248,0.1)"
                              : "transparent",
                            fontWeight: active ? 600 : 400,
                            transition: "background .12s, color .12s",
                          }}
                          onMouseEnter={(e) => {
                            if (!active) {
                              e.currentTarget.style.background =
                                "var(--nav-hover-bg)";
                              e.currentTarget.style.color =
                                "var(--text-primary)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = active
                              ? "rgba(56,189,248,0.1)"
                              : "transparent";
                            e.currentTarget.style.color = active
                              ? "#38bdf8"
                              : "var(--text-tertiary)";
                          }}
                        >
                          <MapPin
                            size={11}
                            style={{
                              flexShrink: 0,
                              color: active ? "#38bdf8" : "var(--arrow-color)",
                            }}
                          />
                          <span className="flex-1 truncate">{c.name}</span>
                          {active && (
                            <span
                              className="rounded-full"
                              style={{
                                width: 6,
                                height: 6,
                                background: "#38bdf8",
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{
                    borderTop: "1px solid var(--border-surface)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span className="text-xs">
                    {cities.length} cities available
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--arrow-color)" }}
                  >
                    Jun – Sep 2024
                  </span>
                </div>
              </div>,
              document.body,
            )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 32,
            height: 32,
            background: "var(--btn-ghost-bg)",
            border: "1px solid var(--btn-ghost-border)",
            color: "var(--btn-ghost-color)",
            cursor: "pointer",
            transition: "all .15s",
          }}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Date range */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{
            background: "var(--btn-ghost-bg)",
            border: "1px solid var(--btn-ghost-border)",
            color: "var(--text-tertiary)",
          }}
        >
          <Calendar size={12} />
          Jun 3 – Sep 3, 2024
        </div>
        {/* Days badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{
            background: "rgba(56,189,248,0.08)",
            border: "1px solid rgba(56,189,248,0.2)",
            color: "#38bdf8",
          }}
        >
          <Database size={12} />
          {data.length} days
        </div>
        {/* API connection status */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{
            background: isApi
              ? "rgba(16,185,129,0.08)"
              : "rgba(251,191,36,0.08)",
            border: isApi
              ? "1px solid rgba(16,185,129,0.2)"
              : "1px solid rgba(251,191,36,0.2)",
            color: isApi ? "#10b981" : "#f59e0b",
          }}
        >
          {isApi ? (
            <>
              <Wifi size={12} /> API
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block ml-1" />
            </>
          ) : (
            <>
              <WifiOff size={12} /> Offline
            </>
          )}
        </div>
      </div>
    </header>
  );
}
