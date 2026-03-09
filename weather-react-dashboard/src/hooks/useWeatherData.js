import { useMemo } from "react";
import { useWeatherContext } from "../contexts/WeatherContext";
import {
  getOverallStats,
  getMonthlyStats,
  getTempDistribution,
  getWindDistribution,
  getCumulativePrecip,
} from "../data/weatherData";

/**
 * Convenience hook: consumes WeatherContext and pre-computes all derived
 * datasets so pages don't have to call utility functions individually.
 *
 * Returns:
 *   cities   – full list [{name, location}] from /api/cities
 *   city     – currently selected city name
 *   setCity  – change the selected city (triggers re-fetch)
 *   data     – raw records array for the selected city
 *   stats    – overall aggregate stats
 *   monthly  – per-month stats array
 *   tempDist – temperature distribution bins
 *   windDist – wind-speed distribution bins
 *   cumul    – cumulative precipitation series
 *   loading  – true while the API request is in-flight
 *   error    – error message string or null
 *   source   – 'api' | 'static'
 *   refetch  – call to manually re-fetch from API
 */
export function useWeatherData() {
  const { cities, city, setCity, data, loading, error, source, refetch } =
    useWeatherContext();

  const stats = useMemo(() => getOverallStats(data), [data]);
  const monthly = useMemo(() => getMonthlyStats(data), [data]);
  const tempDist = useMemo(() => getTempDistribution(data), [data]);
  const windDist = useMemo(() => getWindDistribution(data), [data]);
  const cumul = useMemo(() => getCumulativePrecip(data), [data]);

  return {
    cities,
    city,
    setCity,
    data,
    stats,
    monthly,
    tempDist,
    windDist,
    cumul,
    loading,
    error,
    source,
    refetch,
  };
}
