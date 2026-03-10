// In development, VITE_API_BASE_URL is unset so paths stay as /api/...
// and Vite's proxy forwards them to http://localhost:8000.
// In production (Vercel), set VITE_API_BASE_URL to the Render backend URL,
// e.g. https://your-backend.onrender.com — requests go there directly.
const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000); // 15 s — covers Render cold-start
  try {
    const res = await fetch(`${BASE}${path}`, { signal: controller.signal, ...options });
    if (!res.ok) throw new Error(`API ${path} → HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  /** Full cities list from .env — [{name, location}, …] */
  cities: () => apiFetch("/api/cities"),

  /** Weather records for a city, optionally filtered by month */
  weather: (city, month) => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (month) params.set("month", month);
    const qs = params.toString();
    return apiFetch(qs ? `/api/weather?${qs}` : "/api/weather");
  },

  /** Aggregate stats for a city (or all if no city) */
  stats: (city) =>
    apiFetch(
      city
        ? `/api/weather/stats?city=${encodeURIComponent(city)}`
        : "/api/weather/stats",
    ),

  /** Per-month aggregation for a city (or all) */
  monthly: (city) =>
    apiFetch(
      city
        ? `/api/weather/monthly?city=${encodeURIComponent(city)}`
        : "/api/weather/monthly",
    ),

  /** ETL worker status */
  etlStatus: () => apiFetch("/api/pipeline/status"),

  /** Manually trigger an ETL run for all cities */
  etlTrigger: () => apiFetch("/api/pipeline/trigger", { method: "POST" }),

  /** Health check */
  health: () => apiFetch("/api/health"),
};
