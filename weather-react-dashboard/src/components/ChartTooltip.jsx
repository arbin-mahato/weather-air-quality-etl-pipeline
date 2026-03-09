import { format } from "date-fns";

export default function ChartTooltip({
  active,
  payload,
  label,
  isDate = true,
  extra,
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-glass">
      <p className="text-xs font-semibold mb-2.5" style={{ color: "#64748b" }}>
        {isDate ? format(new Date(label), "MMM d, yyyy") : label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: entry.color }}
          />
          <span className="text-xs" style={{ color: "#94a3b8" }}>
            {entry.name}:
          </span>
          <span className="text-xs font-bold text-white ml-auto pl-3">
            {typeof entry.value === "number"
              ? entry.value.toFixed(1)
              : entry.value}
            {extra?.[entry.dataKey] ?? ""}
          </span>
        </div>
      ))}
    </div>
  );
}
