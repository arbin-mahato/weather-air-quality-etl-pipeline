// All API calls go through Vite's proxy (/api → http://localhost:8000)
// so no absolute URL or CORS headers needed in development.

async function apiFetch(path, options = {}) {
  const res = await fetch(path, options);
  if (!res.ok) throw new Error(`API ${path} → HTTP ${res.status}`);
  return res.json();
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
