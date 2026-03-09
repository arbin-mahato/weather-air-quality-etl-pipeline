# Weather & Air Quality ETL Pipeline

## Overview

An end-to-end data engineering project that extracts daily weather data from the VisualCrossing API, transforms and cleans it with pandas, and loads it into PostgreSQL. A Flask REST API serves the data to a React dashboard with live charts and a built-in ETL control panel.

**Stack:** Python · PostgreSQL · Flask · APScheduler · React · Vite · Recharts · Tailwind CSS

---

## Project Structure

```
weather_air_quality_etl_pipeline/  ← ETL pipeline + Flask backend
├── app.py                         # Flask API + APScheduler (multi-city ETL loop)
├── run_etl.sh                     # One-shot single-city ETL script
├── requirements.txt               # Python dependencies
├── .env                           # API keys, DB credentials & city list (not committed)
├── .env.example                   # Safe template — copy to .env and fill in values
├── src/
│   ├── config.py                  # Config loader — parses CITIES from .env
│   ├── extract.py                 # Fetches daily data from VisualCrossing API
│   ├── transform.py               # Cleans, normalises and enriches data
│   ├── load.py                    # Upserts DataFrame into PostgreSQL
│   └── utils.py                   # Shared helpers
├── sql/
│   └── schema.sql                 # CREATE TABLE statements
└── notebooks/
    └── analysis.ipynb             # Exploratory analysis

weather-react-dashboard/           ← React frontend
├── src/
│   ├── pages/                     # Overview, Temperature, Precipitation, Wind,
│   │                              #   DataExplorer, Pipeline pages
│   ├── components/                # ChartCard, KPICard, Header (city selector), …
│   ├── contexts/WeatherContext.jsx # City state + API/static fallback
│   ├── hooks/useWeatherData.js
│   ├── services/api.js            # Fetch wrapper for Flask API (city-aware)
│   └── data/weatherData.js        # Static fallback dataset (offline mode)
└── vite.config.js                 # /api proxy → http://localhost:8000
```

---

## Technologies

| Layer | Technology |
|---|---|
| Language | Python 3.9+ |
| Data processing | pandas, NumPy |
| Database | PostgreSQL |
| ORM / queries | SQLAlchemy, psycopg2 |
| API server | Flask 3, flask-cors |
| Background worker | APScheduler (24 h interval) |
| Weather data | VisualCrossing API |
| Frontend | React 18, Vite 6 |
| Charts | Recharts |
| Styling | Tailwind CSS, Framer Motion |
| Icons | Lucide React |

---

## ETL Pipeline

The pipeline runs for every city defined in the `CITIES` environment variable (100+ cities by default). `app.py` loops through all cities sequentially and reports per-city progress via the `/api/pipeline/status` endpoint.

### 1. Extract
`src/extract.py` calls the VisualCrossing Timeline API for a given city and date range, returning a JSON payload of daily observations.

### 2. Transform
`src/transform.py` cleans the raw payload:
- Forward-fills missing values
- Selects and renames relevant columns: `date`, `temperature`, `feels_like`, `humidity`, `precipitation`, `wind_speed`
- Ensures correct dtypes and rounds numeric fields

### 3. Load
`src/load.py` writes each city's cleaned DataFrame into the shared `weather_data` table in PostgreSQL. A `city` column identifies the source city. Rows are upserted via `INSERT … ON CONFLICT (city, date) DO UPDATE`, so re-running the ETL never creates duplicates.

---

## Flask API

Started by `python app.py` on **port 8000**. APScheduler re-runs the full multi-city ETL every 24 hours in the background.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server liveness check |
| GET | `/api/cities` | List of all configured cities (`[{name, location}, …]`) |
| GET | `/api/weather` | Weather rows (`?city=Athens`, `?month=YYYY-MM`, `?limit=N`) |
| GET | `/api/weather/stats` | Aggregate stats — avg/max/min temp, precip, wind (`?city=`) |
| GET | `/api/weather/monthly` | Per-month aggregations (`?city=`) |
| GET | `/api/pipeline/status` | ETL state: `status`, `last_run`, `rows_loaded`, `cities_done`, `cities_total`, `current_city`, `next_run` |
| POST | `/api/pipeline/trigger` | Manually kick off a full ETL run (non-blocking, 202) |

---

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL running locally
- VisualCrossing API key (free tier works)

### 1. Clone & configure

```bash
git clone https://github.com/your_username/weather_air_quality_etl_pipeline.git
cd weather_air_quality_etl_pipeline
```

Copy the provided template and fill in your values:

```bash
cp .env.example .env
```

```dotenv
VISUALCROSSING_API_KEY=your_key_here
AIRVISUAL_API_KEY=your_key_here
DATABASE_URL=postgresql://username@localhost:5432/mydb
DEFAULT_START_DATE=2024-06-03
DEFAULT_END_DATE=2024-09-03
# Pipe-delimited pairs: DisplayName|api_location|DisplayName|api_location|…
CITIES=Athens|Athens,Greece|London|London,UK|Paris|Paris,France
```

### 2. Set up the database

```bash
psql -U <username> -d <dbname> -f sql/schema.sql
```

### 3. Set up the Python environment

```bash
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Run the ETL (initial load for all cities)

The recommended way is to start the Flask server (step 5) and trigger the ETL via the API. Alternatively, trigger a one-off run:

```bash
# Trigger via API (while Flask is running)
curl -X POST http://localhost:8000/api/pipeline/trigger

# Or run the shell script (single-city, uses .env defaults)
chmod +x run_etl.sh && ./run_etl.sh
```

### 5. Start the Flask backend

```bash
# from weather_air_quality_etl_pipeline/, with venv active
python app.py
```

Flask starts on `http://localhost:8000`. On startup, the multi-city ETL runs once for all cities in `CITIES`, then the background scheduler repeats it every 24 hours.

### 6. Start the React frontend

```bash
cd ../weather-react-dashboard
npm install        # first time only
npm run dev
```

Open `http://localhost:5173`. The header shows a green **API** badge when the backend is reachable, or **Offline** and falls back to the bundled static dataset.

---

## Viewing Data in PostgreSQL

```bash
psql -U <username> -d <dbname>
```

```sql
-- All rows
SELECT * FROM weather_data ORDER BY date DESC;

-- Quick summary
SELECT COUNT(*), MIN(date), MAX(date),
       ROUND(AVG(temperature)::numeric, 1) AS avg_temp
FROM weather_data;

-- Monthly breakdown
SELECT DATE_TRUNC('month', date)            AS month,
       ROUND(AVG(temperature)::numeric, 1)  AS avg_temp,
       ROUND(SUM(precipitation)::numeric, 1) AS total_rain,
       ROUND(AVG(wind_speed)::numeric, 1)   AS avg_wind
FROM weather_data
GROUP BY 1 ORDER BY 1;

-- Hottest days
SELECT date, temperature FROM weather_data ORDER BY temperature DESC LIMIT 5;
```

---

## Exploratory Analysis

```bash
jupyter notebook notebooks/analysis.ipynb
```

---

## License

MIT — see [LICENSE](LICENSE) for details.
