import { motion } from "framer-motion";

export default function ChartCard({
  title,
  subtitle,
  legend,
  children,
  delay = 0,
  className = "",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`glass glass-hover rounded-2xl p-5 ${className}`}
    >
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          {subtitle && (
            <div className="text-xs mt-0.5" style={{ color: "#475569" }}>
              {subtitle}
            </div>
          )}
        </div>
        {legend && (
          <div className="flex items-center gap-4 flex-wrap">
            {legend.map(({ color, label, dashed }) => (
              <div key={label} className="flex items-center gap-1.5">
                {dashed ? (
                  <div
                    className="w-5 border-t-2 border-dashed"
                    style={{ borderColor: color }}
                  />
                ) : (
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />
                )}
                <span className="text-xs" style={{ color: "#64748b" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {children}
    </motion.div>
  );
}
