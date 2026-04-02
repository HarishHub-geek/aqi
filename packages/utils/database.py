"""
Database connection utility for PSQL.
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
import logging

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://aqi_user:aqi_password@localhost:5432/aqi_platform")

@contextmanager
def get_db_connection():
    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        yield conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise
    finally:
        if conn:
            conn.close()

@contextmanager
def get_db_cursor(commit=False):
    with get_db_connection() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            yield cursor
            if commit:
                conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Database cursor error: {e}")
            raise
        finally:
            cursor.close()

def execute_query(query, params=None, fetch=True):
    """Execute a query and optionally fetch results."""
    with get_db_cursor(commit=not fetch) as cursor:
        cursor.execute(query, params or ())
        if fetch:
            return cursor.fetchall()
        return None

def save_measurement(city_id, timestamp, pollutants, aqi_result):
    """Save a single AQI measurement to the database."""
    query = """
    INSERT INTO aqi_measurements (
        city_id, timestamp, aqi, category, dominant_pollutant,
        pm25, pm10, no2, so2, co, o3,
        temperature, humidity, wind_speed, wind_direction, pressure
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT DO NOTHING;
    """
    params = (
        city_id,
        timestamp,
        aqi_result["aqi"],
        aqi_result["category"],
        aqi_result["dominant_pollutant"],
        pollutants.get("pm25"),
        pollutants.get("pm10"),
        pollutants.get("no2"),
        pollutants.get("so2"),
        pollutants.get("co"),
        pollutants.get("o3"),
        None, # temperature (can be added if available)
        None, # humidity
        None, # wind_speed
        None, # wind_direction
        None  # pressure
    )
    try:
        execute_query(query, params, fetch=False)
        return True
    except Exception as e:
        logger.error(f"Failed to save measurement: {e}")
        return False

def get_historical_measurements(city_id, hours=168):
    """Retrieve historical measurements from the database."""
    query = """
    SELECT * FROM aqi_measurements
    WHERE city_id = %s OR city_id IS NULL
    AND timestamp > NOW() - INTERVAL '%s hours'
    ORDER BY timestamp DESC
    LIMIT %s;
    """
    params = (city_id, hours, hours)
    try:
        return execute_query(query, params)
    except Exception as e:
        logger.error(f"Failed to fetch historical data: {e}")
        return []

def save_forecast(city_id, timestamp, predicted_aqi, model="RandomForest", confidence=0.9):
    """Save a forecast point to the database."""
    query = """
    INSERT INTO forecasts (
        city_id, forecast_timestamp, aqi_predicted, confidence, model
    ) VALUES (%s, %s, %s, %s, %s);
    """
    params = (city_id, timestamp, predicted_aqi, confidence, model)
    try:
        execute_query(query, params, fetch=False)
        return True
    except Exception as e:
        logger.error(f"Failed to save forecast: {e}")
        return False
