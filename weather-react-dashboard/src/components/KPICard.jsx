import { motion } from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";

export default function KPICard({
  label,
  value,
  unit = "",
  sub,
  color,
  icon,
  delay = 0,
  decimals = 1,
}) {
  const numeric = parseFloat(value);
  const isNumber = !isNaN(numeric);
  const counted = useCountUp(isNumber ? numeric : 0, 1100, decimals);
  const displayed = isNumber ? counted : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="glass glass-hover rounded-2xl p-5 relative overflow-hidden cursor-default select-none"
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />

      {/* Glow on hover (handled via box-shadow in tailwind) */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
        style={{ boxShadow: `0 0 40px ${color}18`, opacity: 0 }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
      />

      <div className="mb-3" style={{ color }}>
        {icon}
      </div>
      <div
        className="text-xs font-700 uppercase tracking-widest mb-2"
        style={{ color: "var(--text-secondary)", letterSpacing: "0.09em" }}
      >
        {label}
      </div>
      <div
        className="font-extrabold leading-none mb-2"
        style={{ fontSize: "2rem", letterSpacing: "-0.04em", color }}
      >
        {isNumber ? displayed : value}
        {unit}
      </div>
      <div
        className="text-xs leading-snug"
        style={{ color: "var(--text-muted)" }}
      >
        {sub}
      </div>
    </motion.div>
  );
}
