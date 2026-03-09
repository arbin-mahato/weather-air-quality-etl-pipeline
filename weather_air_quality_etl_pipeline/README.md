# Weather & Air Quality ETL Pipeline

## Overview

An end-to-end data engineering project that extracts daily weather data from the VisualCrossing API, transforms and cleans it with pandas, and loads it into PostgreSQL. A Flask REST API serves the data to a React dashboard with live charts and a built-in ETL control panel.

**Stack:** Python · PostgreSQL · Flask · APScheduler · React · Vite · Recharts · Tailwind CSS

---

## Project Structure

```
weather_air_quality_etl_pipline/   ← ETL pipeline + Flask backend
├── app.py                         # Flask API + APScheduler background worker
├── run_etl.sh                     # One-shot ETL script
├── requirements.txt               # Python dependencies
├── .env                           # API keys & DB credentials (not committed)
├── src/
│   ├── config.py                  # Config loader (reads .env)
│   ├── extract.py                 # Fetches data from VisualCrossing API
│   ├── transform.py               # Cleans, normalises and enriches data
│   ├── load.py                    # Writes DataFrame to PostgreSQL
│   └── utils.py                   # Shared helpers
├── sql/
│   └── schema.sql                 # CREATE TABLE statements
└── notebooks/
    └── analysis.ipynb             # Exploratory analysis

weather-react-dashboard/           ← React frontend
├── src/
│   ├── pages/                     # Overview, Temperature, Precipitation, Wind,
│   │                              #   DataExplorer, Pipeline pages
│   ├── components/                # ChartCard, KPICard, Header, Layout, …
│   ├── contexts/WeatherContext.jsx
│   ├── hooks/useWeatherData.js
│   ├── services/api.js            # Fetch wrapper for Flask API
│   └── data/weatherData.js        # Static fallback dataset
└── vite.config.js                 # /api proxy → http://localhost:8000
```

---

## Technologies

| Layer             | Technology                  |
| ----------------- | --------------------------- |
| Language          | Python 3.9+                 |
| Data processing   | pandas, NumPy               |
| Database          | PostgreSQL                  |
| ORM / queries     | SQLAlchemy, psycopg2        |
| API server        | Flask 3, flask-cors         |
| Background worker | APScheduler (24 h interval) |
| Weather data      | VisualCrossing API          |
| Frontend          | React 18, Vite 6            |
| Charts            | Recharts                    |
| Styling           | Tailwind CSS, Framer Motion |
| Icons             | Lucide React                |

---

## ETL Pipeline

### 1. Extract

`src/extract.py` calls the VisualCrossing Timeline API for a configured city and date range, returning a JSON payload of daily observations.

### 2. Transform

`src/transform.py` cleans the raw payload:

- Forward-fills missing values
- Selects and renames relevant columns: `date`, `temperature`, `feels_like`, `humidity`, `precipitation`, `wind_speed`
- Ensures correct dtypes and rounds numeric fields

### 3. Load

`src/load.py` writes the cleaned DataFrame to the `weather_data` table in PostgreSQL using `DataFrame.to_sql()` with `if_exists='replace'`.

---

## Flask API

Started by `python app.py` on **port 8000**. APScheduler re-runs the ETL every 24 hours in the background.

| Method | Endpoint                | Description                                        |
| ------ | ----------------------- | -------------------------------------------------- |
| GET    | `/api/health`           | Server liveness check                              |
| GET    | `/api/weather`          | All rows (`?month=YYYY-MM`, `?limit=N`)            |
| GET    | `/api/weather/stats`    | Aggregate stats (avg/max/min temp, precip, wind)   |
| GET    | `/api/weather/monthly`  | Per-month aggregations                             |
| GET    | `/api/pipeline/status`  | ETL state: status, last_run, rows_loaded, next_run |
| POST   | `/api/pipeline/trigger` | Manually kick off an ETL run (non-blocking, 202)   |

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL running locally
- VisualCrossing API key (free tier works)

### 1. Clone & configure

```bash
git clone https://github.com/your_username/weather_air_quality_etl_pipline.git
cd weather_air_quality_etl_pipline
```

Create a `.env` file:

```
VISUALCROSSING_API_KEY=your_key_here
AIRVISUAL_API_KEY=your_key_here
DATABASE_URL=postgresql://username@localhost:5432/mydb
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

### 4. Run the ETL once (initial load)

```bash
# Option A — individual steps
python src/extract.py
python src/transform.py
python src/load.py

# Option B — shell script
chmod +x run_etl.sh && ./run_etl.sh
```

### 5. Start the Flask backend

```bash
# from weather_air_quality_etl_pipline/, with venv active
python app.py
```

Flask starts on `http://localhost:8000`. The background scheduler will re-run the ETL every 24 hours automatically.

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
