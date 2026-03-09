import { createContext, useContext, useEffect, useState } from "react";
import { weatherData as staticData } from "../data/weatherData";
import { api } from "../services/api";

const WeatherContext = createContext(null);

// Static fallback city list — mirrors CITIES in .env so the selector is
// always populated even when the Flask backend is offline.
const STATIC_CITIES = [
  { name: "Athens", location: "Athens,Greece" },
  { name: "London", location: "London,UK" },
  { name: "Paris", location: "Paris,France" },
  { name: "Berlin", location: "Berlin,Germany" },
  { name: "Rome", location: "Rome,Italy" },
  { name: "Madrid", location: "Madrid,Spain" },
  { name: "Amsterdam", location: "Amsterdam,Netherlands" },
  { name: "Vienna", location: "Vienna,Austria" },
  { name: "Prague", location: "Prague,Czech Republic" },
  { name: "Budapest", location: "Budapest,Hungary" },
  { name: "Warsaw", location: "Warsaw,Poland" },
  { name: "Stockholm", location: "Stockholm,Sweden" },
  { name: "Oslo", location: "Oslo,Norway" },
  { name: "Copenhagen", location: "Copenhagen,Denmark" },
  { name: "Helsinki", location: "Helsinki,Finland" },
  { name: "Brussels", location: "Brussels,Belgium" },
  { name: "Lisbon", location: "Lisbon,Portugal" },
  { name: "Zurich", location: "Zurich,Switzerland" },
  { name: "Dublin", location: "Dublin,Ireland" },
  { name: "Edinburgh", location: "Edinburgh,UK" },
  { name: "Barcelona", location: "Barcelona,Spain" },
  { name: "Munich", location: "Munich,Germany" },
  { name: "Milan", location: "Milan,Italy" },
  { name: "Lyon", location: "Lyon,France" },
  { name: "Hamburg", location: "Hamburg,Germany" },
  { name: "Rotterdam", location: "Rotterdam,Netherlands" },
  { name: "Krakow", location: "Krakow,Poland" },
  { name: "Ioannina", location: "Ioannina,Greece" },
  { name: "Thessaloniki", location: "Thessaloniki,Greece" },
  { name: "New York", location: "New York,US" },
  { name: "Los Angeles", location: "Los Angeles,US" },
  { name: "Chicago", location: "Chicago,US" },
  { name: "Houston", location: "Houston,US" },
  { name: "Phoenix", location: "Phoenix,US" },
  { name: "Philadelphia", location: "Philadelphia,US" },
  { name: "San Antonio", location: "San Antonio,US" },
  { name: "Seattle", location: "Seattle,US" },
  { name: "Denver", location: "Denver,US" },
  { name: "Boston", location: "Boston,US" },
  { name: "Miami", location: "Miami,US" },
  { name: "Atlanta", location: "Atlanta,US" },
  { name: "Minneapolis", location: "Minneapolis,US" },
  { name: "Portland", location: "Portland,US" },
  { name: "Las Vegas", location: "Las Vegas,US" },
  { name: "San Francisco", location: "San Francisco,US" },
  { name: "Dallas", location: "Dallas,US" },
  { name: "Austin", location: "Austin,US" },
  { name: "Toronto", location: "Toronto,Canada" },
  { name: "Vancouver", location: "Vancouver,Canada" },
  { name: "Montreal", location: "Montreal,Canada" },
  { name: "Mexico City", location: "Mexico City,Mexico" },
  { name: "Guadalajara", location: "Guadalajara,Mexico" },
  { name: "Buenos Aires", location: "Buenos Aires,Argentina" },
  { name: "Santiago", location: "Santiago,Chile" },
  { name: "Lima", location: "Lima,Peru" },
  { name: "Bogota", location: "Bogota,Colombia" },
  { name: "São Paulo", location: "Sao Paulo,Brazil" },
  { name: "Rio de Janeiro", location: "Rio de Janeiro,Brazil" },
  { name: "Caracas", location: "Caracas,Venezuela" },
  { name: "Tokyo", location: "Tokyo,Japan" },
  { name: "Beijing", location: "Beijing,China" },
  { name: "Shanghai", location: "Shanghai,China" },
  { name: "Seoul", location: "Seoul,South Korea" },
  { name: "Mumbai", location: "Mumbai,India" },
  { name: "Delhi", location: "Delhi,India" },
  { name: "Bangalore", location: "Bangalore,India" },
  { name: "Bangkok", location: "Bangkok,Thailand" },
  { name: "Singapore", location: "Singapore" },
  { name: "Kuala Lumpur", location: "Kuala Lumpur,Malaysia" },
  { name: "Jakarta", location: "Jakarta,Indonesia" },
  { name: "Manila", location: "Manila,Philippines" },
  { name: "Ho Chi Minh City", location: "Ho Chi Minh City,Vietnam" },
  { name: "Hanoi", location: "Hanoi,Vietnam" },
  { name: "Taipei", location: "Taipei,Taiwan" },
  { name: "Hong Kong", location: "Hong Kong" },
  { name: "Osaka", location: "Osaka,Japan" },
  { name: "Karachi", location: "Karachi,Pakistan" },
  { name: "Dhaka", location: "Dhaka,Bangladesh" },
  { name: "Colombo", location: "Colombo,Sri Lanka" },
  { name: "Kathmandu", location: "Kathmandu,Nepal" },
  { name: "Islamabad", location: "Islamabad,Pakistan" },
  { name: "Cairo", location: "Cairo,Egypt" },
  { name: "Lagos", location: "Lagos,Nigeria" },
  { name: "Nairobi", location: "Nairobi,Kenya" },
  { name: "Johannesburg", location: "Johannesburg,South Africa" },
  { name: "Casablanca", location: "Casablanca,Morocco" },
  { name: "Accra", location: "Accra,Ghana" },
  { name: "Addis Ababa", location: "Addis Ababa,Ethiopia" },
  { name: "Kinshasa", location: "Kinshasa,Democratic Republic of the Congo" },
  { name: "Dar es Salaam", location: "Dar es Salaam,Tanzania" },
  { name: "Dubai", location: "Dubai,UAE" },
  { name: "Istanbul", location: "Istanbul,Turkey" },
  { name: "Riyadh", location: "Riyadh,Saudi Arabia" },
  { name: "Tel Aviv", location: "Tel Aviv,Israel" },
  { name: "Beirut", location: "Beirut,Lebanon" },
  { name: "Amman", location: "Amman,Jordan" },
  { name: "Baghdad", location: "Baghdad,Iraq" },
  { name: "Muscat", location: "Muscat,Oman" },
  { name: "Tbilisi", location: "Tbilisi,Georgia" },
  { name: "Baku", location: "Baku,Azerbaijan" },
  { name: "Yerevan", location: "Yerevan,Armenia" },
  { name: "Sydney", location: "Sydney,Australia" },
  { name: "Melbourne", location: "Melbourne,Australia" },
  { name: "Auckland", location: "Auckland,New Zealand" },
  { name: "Honolulu", location: "Honolulu,US" },
  { name: "Anchorage", location: "Anchorage,US" },
];

/**
 * Provides:
 *  - cities      list of {name, location} from /api/cities
 *  - city        currently selected city name (string)
 *  - setCity     setter — changing triggers a re-fetch
 *  - data        weather rows for the selected city
 *  - loading     true while fetching
 *  - error       error message or null
 *  - source      'api' | 'static'
 *  - refetch     manual refresh
 */
export function WeatherProvider({ children }) {
  const [cities, setCities] = useState(STATIC_CITIES);
  const [city, setCity] = useState(STATIC_CITIES[0].name);
  const [data, setData] = useState(staticData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState("static");

  // Load city list on mount
  useEffect(() => {
    api
      .cities()
      .then((list) => {
        if (list?.length > 0) {
          setCities(list);
          // Keep city selection if it still exists in new list
          setCity((prev) =>
            list.find((c) => c.name === prev) ? prev : list[0].name,
          );
        }
      })
      .catch(() => {}); // keep static fallback silently
  }, []);

  async function fetchData(selectedCity) {
    setLoading(true);
    setError(null);
    try {
      const rows = await api.weather(selectedCity);
      if (rows?.length > 0) {
        setData(rows);
        setSource("api");
      } else {
        // city exists in list but no data loaded yet — show empty+static fallback
        setData(staticData);
        setSource("static");
      }
    } catch (err) {
      setError(err.message);
      setSource("static");
    } finally {
      setLoading(false);
    }
  }

  // Re-fetch whenever selected city changes
  useEffect(() => {
    fetchData(city);
  }, [city]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <WeatherContext.Provider
      value={{
        cities,
        city,
        setCity,
        data,
        loading,
        error,
        source,
        refetch: () => fetchData(city),
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeatherContext() {
  const ctx = useContext(WeatherContext);
  if (!ctx)
    throw new Error("useWeatherContext must be used inside <WeatherProvider>");
  return ctx;
}
