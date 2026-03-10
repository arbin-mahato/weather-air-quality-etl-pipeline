"""
Flask REST API — Weather & Air Quality ETL Project
===================================================
Multi-city support: fetches data for every city defined in .env CITIES list,
stores all rows in a single weather_data table (with a `city` column), and
serves per-city filtered endpoints to the React frontend.

Start with:
    python app.py
"""

import os
import sys
import time
import datetime
import threading
import logging

from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import create_engine, text
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from dotenv import load_dotenv

# ── Path setup: import ETL modules from src/ ─────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(BASE_DIR, "src"))

load_dotenv(os.path.join(BASE_DIR, ".env"))

from config import Config
from extract import fetch_weather_data
from transform import transform_data
from load import load_data_to_postgresql, ensure_table, create_database_engine

# ── App setup ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])  # allow Vite dev server

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ── DB engine (shared across all routes) ─────────────────────────────────────
engine = create_engine(Config.DATABASE_URL, pool_pre_ping=True)

# Ensure table exists with the city column on startup
try:
    ensure_table(engine)
    log.info("DB table ready.")
except Exception as _e:
    log.warning(f"Could not ensure table on startup: {_e}")

# ── ETL run state ─────────────────────────────────────────────────────────────
_etl_lock = threading.Lock()
etl_state = {
    "status":       "never",  # never | running | success | error
    "last_run":     None,
    "rows_loaded":  0,
    "cities_done":  0,
    "cities_total": 0,
    "current_city": None,
    "error":        None,
    "next_run":     None,
}


def run_etl():
    """Loop over every city in Config.get_cities() and run Extract→Transform→Load."""
    cities = Config.get_cities()

    with _etl_lock:
        if etl_state["status"] == "running":
            log.warning("ETL already running — ignoring duplicate trigger.")
            return
        etl_state.update({
            "status":       "running",
            "last_run":     datetime.datetime.utcnow().isoformat() + "Z",
            "error":        None,
            "rows_loaded":  0,
            "cities_done":  0,
            "cities_total": len(cities),
            "current_city": None,
        })

    log.info(f"ETL starting — {len(cities)} cities …")
    total_rows = 0
    errors = []

    for city in cities:
        with _etl_lock:
            etl_state["current_city"] = city["name"]

        log.info(f"  Fetching {city['name']} ({city['location']}) …")
        try:
            raw = fetch_weather_data(
                city["location"],
                Config.DEFAULT_START_DATE,
                Config.DEFAULT_END_DATE,
            )
            df = transform_data(raw)
            load_data_to_postgresql(df, city["name"])
            total_rows += len(df)

            with _etl_lock:
                etl_state["cities_done"] += 1
                etl_state["rows_loaded"] = total_rows

        except Exception as exc:
            log.error(f"  FAILED {city['name']}: {exc}")
            errors.append(f"{city['name']}: {exc}")
            with _etl_lock:
                etl_state["cities_done"] += 1

        # Respect VisualCrossing free-tier rate limit (~1 req/s)
        time.sleep(1)

    with _etl_lock:
        etl_state["current_city"] = None
        if errors:
            etl_state["status"] = "partial"
            etl_state["error"]  = "; ".join(errors[:3]) + (
                f" (+{len(errors)-3} more)" if len(errors) > 3 else ""
            )
        else:
            etl_state["status"] = "success"
            etl_state["error"]  = None

    log.info(f"ETL done — {total_rows} rows across {len(cities)} cities.")


# ── Background scheduler (runs ETL every 24 h) ───────────────────────────────
scheduler = BackgroundScheduler(daemon=True)
scheduler.add_job(
    run_etl,
    IntervalTrigger(hours=24),
    id="etl_daily",
    next_run_time=None,   # don't run immediately on boot
)
scheduler.start()
log.info("Background scheduler started (ETL every 24 h).")


def _next_run_iso():
    job = scheduler.get_job("etl_daily")
    if job and job.next_run_time:
        return job.next_run_time.isoformat()
    return None


# ── Helper ───────────────────────────────────────────────────────────────────
def _row_to_dict(r):
    return {
        "date":          str(r["date"])[:10],
        "temperature":   round(float(r["temperature"]),  1),
        "feels_like":    round(float(r["feels_like"]),   1),
        "humidity":      round(float(r["humidity"]),     1),
        "precipitation": round(float(r["precipitation"]), 3),
        "wind_speed":    round(float(r["wind_speed"]),   1),
    }


# ── API routes ────────────────────────────────────────────────────────────────

@app.route("/api/health")
def health():
    return jsonify({
        "status":    "ok",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
    })


@app.route("/api/cities")
def get_cities():
    """Return the full cities list from .env (name + location)."""
    return jsonify(Config.get_cities())


@app.route("/api/weather")
def get_weather():
    """
    Returns weather records. Required query param:
      - city=<display name>   e.g. city=Athens
    Optional:
      - month=YYYY-MM
      - limit=N
    """
    city  = request.args.get("city")
    month = request.args.get("month")
    limit = request.args.get("limit", type=int)

    conditions = []
    params: dict = {}

    if city:
        conditions.append("city = :city")
        params["city"] = city
    if month:
        conditions.append("CAST(date AS TEXT) LIKE :month")
        params["month"] = f"{month}%"

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    sql   = f"SELECT * FROM weather_data {where} ORDER BY date"

    if limit:
        sql += " LIMIT :limit"
        params["limit"] = limit

    with engine.connect() as conn:
        rows = conn.execute(text(sql), params).mappings().all()

    return jsonify([_row_to_dict(r) for r in rows])


@app.route("/api/weather/stats")
def get_stats():
    """Aggregate statistics for a city (or entire dataset if no city param)."""
    city = request.args.get("city")
    where = "WHERE city = :city" if city else ""
    sub_where = "WHERE city = :city" if city else ""
    params = {"city": city} if city else {}

    with engine.connect() as conn:
        row = conn.execute(text(f"""
            SELECT
                ROUND(AVG(temperature)::numeric,   1) AS avg_temp,
                ROUND(MAX(temperature)::numeric,   1) AS max_temp,
                ROUND(MIN(temperature)::numeric,   1) AS min_temp,
                ROUND(AVG(humidity)::numeric,      1) AS avg_humidity,
                ROUND(SUM(precipitation)::numeric, 1) AS total_precip,
                ROUND(MAX(precipitation)::numeric, 1) AS max_precip,
                ROUND(AVG(wind_speed)::numeric,    1) AS avg_wind,
                ROUND(MAX(wind_speed)::numeric,    1) AS max_wind,
                COUNT(*)                               AS total_days,
                COUNT(CASE WHEN precipitation > 0 THEN 1 END) AS rainy_days,
                (SELECT CAST(date AS TEXT) FROM weather_data {sub_where}
                    ORDER BY temperature   DESC LIMIT 1) AS max_temp_day,
                (SELECT CAST(date AS TEXT) FROM weather_data {sub_where}
                    ORDER BY temperature   ASC  LIMIT 1) AS min_temp_day,
                (SELECT CAST(date AS TEXT) FROM weather_data {sub_where}
                    ORDER BY precipitation DESC LIMIT 1) AS max_precip_day,
                (SELECT CAST(date AS TEXT) FROM weather_data {sub_where}
                    ORDER BY wind_speed    DESC LIMIT 1) AS max_wind_day
            FROM weather_data {where}
        """), params).mappings().one()
    return jsonify(dict(row))


@app.route("/api/weather/monthly")
def get_monthly():
    """Per-month aggregation for a city (or all cities if no city param)."""
    city = request.args.get("city")
    where = "WHERE city = :city" if city else ""
    params = {"city": city} if city else {}

    with engine.connect() as conn:
        rows = conn.execute(text(f"""
            SELECT
                TO_CHAR(date, 'Mon YYYY')              AS month,
                TO_CHAR(date, 'YYYY-MM')               AS code,
                COUNT(*)                                AS days,
                ROUND(AVG(temperature)::numeric,  1)   AS avg_temp,
                ROUND(MAX(temperature)::numeric,  1)   AS max_temp,
                ROUND(MIN(temperature)::numeric,  1)   AS min_temp,
                ROUND(AVG(humidity)::numeric,     1)   AS avg_humidity,
                ROUND(SUM(precipitation)::numeric, 1)  AS total_precip,
                COUNT(CASE WHEN precipitation > 0 THEN 1 END) AS rainy_days,
                ROUND(AVG(wind_speed)::numeric,   1)   AS avg_wind,
                ROUND(MAX(wind_speed)::numeric,   1)   AS max_wind
            FROM weather_data {where}
            GROUP BY
                TO_CHAR(date, 'Mon YYYY'),
                TO_CHAR(date, 'YYYY-MM'),
                DATE_TRUNC('month', date)
            ORDER BY DATE_TRUNC('month', date)
        """), params).mappings().all()
    return jsonify([dict(r) for r in rows])


@app.route("/api/pipeline/status")
def pipeline_status():
    return jsonify({**etl_state, "next_run": _next_run_iso()})


@app.route("/api/pipeline/trigger", methods=["POST"])
def trigger_pipeline():
    """Manually kick off an ETL run for all cities (non-blocking)."""
    if etl_state["status"] == "running":
        return jsonify({"message": "ETL already running — please wait."}), 409
    threading.Thread(target=run_etl, daemon=True).start()
    return jsonify({"message": "ETL pipeline triggered for all cities"}), 202


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000, use_reloader=False)

