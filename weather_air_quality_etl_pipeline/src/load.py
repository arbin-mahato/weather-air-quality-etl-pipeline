import pandas as pd
from sqlalchemy import create_engine, text
import sys
from config import Config
from utils import setup_logger

# Initialize logger
logger = setup_logger(__name__)

def create_database_engine():
    """
    Create a SQLAlchemy engine for connecting to the PostgreSQL database.

    Returns:
        engine: SQLAlchemy engine object.
    """
    try:
        engine = create_engine(Config.DATABASE_URL)
        return engine
    except Exception as e:
        logger.error(f"Error creating database engine: {e}")
        sys.exit(1)

def ensure_table(engine):
    """Create weather_data table with city column if it doesn't exist."""
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS weather_data (
                id          SERIAL PRIMARY KEY,
                city        TEXT        NOT NULL,
                date        DATE        NOT NULL,
                temperature NUMERIC(5,2),
                feels_like  NUMERIC(5,2),
                humidity    NUMERIC(5,2),
                precipitation NUMERIC(7,3),
                wind_speed  NUMERIC(5,2),
                UNIQUE (city, date)
            )
        """))
        conn.commit()

def load_data_to_postgresql(df, city_name, table_name="weather_data"):
    """
    Load the DataFrame into a PostgreSQL database table.
    Uses INSERT … ON CONFLICT (city, date) DO UPDATE so existing rows are
    refreshed rather than duplicated, and data for other cities is preserved.

    Parameters:
        df (pd.DataFrame): The DataFrame containing the transformed data.
        city_name (str): Display name of the city (stored in the city column).
        table_name (str): The name of the table to load the data into.
    """
    engine = create_database_engine()
    ensure_table(engine)

    df = df.copy()
    df["city"] = city_name

    try:
        # Write to a temp table, then upsert into weather_data
        with engine.connect() as conn:
            df.to_sql("_weather_tmp", conn, if_exists="replace", index=False)
            conn.execute(text(f"""
                INSERT INTO {table_name}
                    (city, date, temperature, feels_like, humidity, precipitation, wind_speed)
                SELECT city, date, temperature, feels_like, humidity, precipitation, wind_speed
                FROM _weather_tmp
                ON CONFLICT (city, date)
                DO UPDATE SET
                    temperature   = EXCLUDED.temperature,
                    feels_like    = EXCLUDED.feels_like,
                    humidity      = EXCLUDED.humidity,
                    precipitation = EXCLUDED.precipitation,
                    wind_speed    = EXCLUDED.wind_speed
            """))
            conn.execute(text("DROP TABLE IF EXISTS _weather_tmp"))
            conn.commit()
        logger.info(f"Data loaded for {city_name} ({len(df)} rows).")
    except Exception as e:
        logger.error(f"Error loading data to PostgreSQL: {e}")
        raise

