import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Thermometer,
  CloudRain,
  Wind,
  Table2,
  GitBranch,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CloudSun,
} from "lucide-react";

const NAV = [
  { to: "/", icon: LayoutDashboard, label: "Overview" },
  { to: "/temperature", icon: Thermometer, label: "Temperature" },
  { to: "/precipitation", icon: CloudRain, label: "Precipitation" },
  { to: "/wind", icon: Wind, label: "Wind" },
  { to: "/explorer", icon: Table2, label: "Data Explorer" },
  { to: "/pipeline", icon: GitBranch, label: "ETL Pipeline" },
];

export default function Sidebar({ collapsed, onToggle }) {
  const w = collapsed ? 64 : 240;

  return (
    <motion.aside
      animate={{ width: w }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 flex-shrink-0 h-screen flex flex-col"
      style={{
        background: "rgba(6,14,26,0.98)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5"
        style={{ minHeight: 72 }}
      >
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(56,189,248,0.18), rgba(167,139,250,0.18))",
            border: "1px solid rgba(56,189,248,0.25)",
          }}
        >
          <CloudSun size={18} style={{ color: "#38bdf8" }} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="font-bold text-sm text-white leading-tight">
                WeatherSight
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#475569" }}>
                Ioannina · 2024
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Section label */}
      {!collapsed && (
        <div className="px-4 mb-2">
          <div className="section-title">Navigation</div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium select-none ${isActive ? "nav-active" : "text-slate-400"}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="truncate"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Bottom: location + collapse btn */}
      <div
        className="mt-auto border-t px-3 py-4 space-y-3"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        {/* City tag */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-2"
          >
            <MapPin size={13} className="text-slate-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-400">
                Ioannina, Greece
              </div>
              <div className="text-xs text-slate-600">Jun 3 – Sep 3, 2024</div>
            </div>
          </motion.div>
        )}
        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2 text-slate-500 hover:text-slate-300 transition-colors"
          style={{ background: "rgba(255,255,255,0.04)" }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <>
              <ChevronLeft size={16} />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
