import { motion } from "framer-motion";

export default function InsightCard({
  icon,
  title,
  children,
  color,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="glass glass-hover rounded-2xl p-5 flex gap-4"
    >
      <div className="flex-shrink-0 mt-0.5" style={{ color }}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold mb-1" style={{ color }}>
          {title}
        </div>
        <div className="text-xs leading-relaxed" style={{ color: "#64748b" }}>
          {children}
        </div>
      </div>
    </motion.div>
  );
}
