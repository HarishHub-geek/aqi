"""
Data sources integration for OpenAQ and Open-Meteo APIs.
Fetches pollutant concentrations and weather data for Indian cities.
"""

import asyncio
import random
import math
import httpx
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging
from packages.utils.database import save_measurement

logger = logging.getLogger(__name__)

OPENAQ_BASE_URL = "https://api.openaq.org/v2"
OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1"


async def fetch_openaq_data(city_id: str, lat: float, lon: float, radius: int = 25000) -> Optional[Dict]:
    """
    Fetch latest air quality data from OpenAQ for a given location.
    Returns dict with pollutant concentrations.
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                f"{OPENAQ_BASE_URL}/latest",
                params={
                    "coordinates": f"{lat},{lon}",
                    "radius": radius,
                    "limit": 10,
                    "order_by": "distance",
                },
                headers={"Accept": "application/json"},
            )
            
            if response.status_code != 200:
                logger.warning(f"OpenAQ returned status {response.status_code}")
                return None
            
            data = response.json()
            results = data.get("results", [])
            
            if not results:
                return None
            
            # Aggregate measurements from nearest stations
            pollutants = {}
            param_mapping = {
                "pm25": "pm25",
                "pm10": "pm10",
                "no2": "no2",
                "so2": "so2",
                "co": "co",
                "o3": "o3",
            }
            
            for result in results:
                measurements = result.get("measurements", [])
                for m in measurements:
                    param = m.get("parameter", "")
                    value = m.get("value")
                    if param in param_mapping and value is not None and value >= 0:
                        key = param_mapping[param]
                        if key not in pollutants:
                            pollutants[key] = value
            
            if pollutants:
                # Save to database in background (fire and forget for now or simple await)
                try:
                    from .aqi_calculator import calculate_aqi
                    aqi_result = calculate_aqi(pollutants)
                    save_measurement(
                        city_id=city_id,
                        timestamp=datetime.utcnow(),
                        pollutants=pollutants,
                        aqi_result=aqi_result
                    )
                except Exception as db_e:
                    logger.error(f"Failed to auto-save OpenAQ data: {db_e}")
                
                return pollutants
            return None
            
    except Exception as e:
        logger.error(f"OpenAQ fetch error: {e}")
        return None


async def fetch_openaq_history(city_id: str, lat: float, lon: float, days: int = 7) -> List[Dict]:
    """
    Fetch historical air quality measurements from OpenAQ.
    """
    try:
        date_from = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%S+00:00")
        date_to = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S+00:00")
        
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(
                f"{OPENAQ_BASE_URL}/measurements",
                params={
                    "coordinates": f"{lat},{lon}",
                    "radius": 25000,
                    "date_from": date_from,
                    "date_to": date_to,
                    "limit": 1000,
                    "order_by": "datetime",
                    "sort": "desc",
                },
                headers={"Accept": "application/json"},
            )
            
            if response.status_code != 200:
                return []
            
            data = response.json()
            results = data.get("results", [])
            
            if results:
                try:
                    from .aqi_calculator import calculate_aqi
                    for result in results:
                        # Extract pollutants for each result
                        pollutants = {}
                        m_list = result.get("measurements", [])
                        for m in m_list:
                            param = m.get("parameter", "")
                            val = m.get("value")
                            if val is not None and val >= 0:
                                pollutants[param] = val
                        
                        if pollutants:
                            aqi_result = calculate_aqi(pollutants)
                            ts = result.get("date", {}).get("utc")
                            if ts:
                                save_measurement(
                                    city_id=city_id,
                                    timestamp=ts,
                                    pollutants=pollutants,
                                    aqi_result=aqi_result
                                )
                except Exception as db_e:
                    logger.error(f"Failed to auto-save historical OpenAQ data: {db_e}")
            
            return results
            
    except Exception as e:
        logger.error(f"OpenAQ history error: {e}")
        return []


async def fetch_weather_data(lat: float, lon: float) -> Optional[Dict]:
    """
    Fetch current weather data from Open-Meteo.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{OPEN_METEO_BASE_URL}/forecast",
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "current_weather": True,
                    "hourly": "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,pressure_msl",
                    "forecast_days": 2,
                    "timezone": "Asia/Kolkata",
                },
            )
            
            if response.status_code != 200:
                return None
            
            data = response.json()
            current = data.get("current_weather", {})
            hourly = data.get("hourly", {})
            
            return {
                "temperature": current.get("temperature"),
                "wind_speed": current.get("windspeed"),
                "wind_direction": current.get("winddirection"),
                "weather_code": current.get("weathercode"),
                "humidity": hourly.get("relative_humidity_2m", [None])[0] if hourly.get("relative_humidity_2m") else None,
                "pressure": hourly.get("pressure_msl", [None])[0] if hourly.get("pressure_msl") else None,
                "hourly": {
                    "time": hourly.get("time", []),
                    "temperature": hourly.get("temperature_2m", []),
                    "humidity": hourly.get("relative_humidity_2m", []),
                    "wind_speed": hourly.get("wind_speed_10m", []),
                    "wind_direction": hourly.get("wind_direction_10m", []),
                },
            }
            
    except Exception as e:
        logger.error(f"Weather fetch error: {e}")
        return None


async def fetch_weather_history(lat: float, lon: float, days: int = 90) -> Optional[Dict]:
    """
    Fetch historical weather data from Open-Meteo archive.
    """
    try:
        end_date = datetime.utcnow().strftime("%Y-%m-%d")
        start_date = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{OPEN_METEO_BASE_URL}/forecast",
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "hourly": "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m",
                    "start_date": start_date,
                    "end_date": end_date,
                    "timezone": "Asia/Kolkata",
                },
            )
            
            if response.status_code != 200:
                return None
            
            return response.json().get("hourly")
            
    except Exception as e:
        logger.error(f"Weather history error: {e}")
        return None


def generate_synthetic_aqi_data(city_id: str) -> Dict:
    """
    Generate realistic synthetic AQI data for a city when APIs are unavailable.
    Uses city-specific baselines to simulate realistic Indian air quality patterns.
    """
    # City-specific pollution baselines (typical Indian city AQI ranges)
    baselines = {
        "delhi": {"pm25": 180, "pm10": 250, "no2": 60, "so2": 20, "co": 2.5, "o3": 40},
        "mumbai": {"pm25": 80, "pm10": 120, "no2": 45, "so2": 15, "co": 1.8, "o3": 35},
        "kolkata": {"pm25": 100, "pm10": 150, "no2": 50, "so2": 18, "co": 2.0, "o3": 38},
        "chennai": {"pm25": 50, "pm10": 80, "no2": 30, "so2": 10, "co": 1.2, "o3": 45},
        "bangalore": {"pm25": 55, "pm10": 90, "no2": 35, "so2": 12, "co": 1.3, "o3": 42},
        "hyderabad": {"pm25": 65, "pm10": 100, "no2": 38, "so2": 14, "co": 1.5, "o3": 40},
        "ahmedabad": {"pm25": 90, "pm10": 140, "no2": 42, "so2": 16, "co": 1.7, "o3": 38},
        "pune": {"pm25": 60, "pm10": 95, "no2": 32, "so2": 11, "co": 1.3, "o3": 43},
        "jaipur": {"pm25": 95, "pm10": 160, "no2": 40, "so2": 15, "co": 1.6, "o3": 36},
        "lucknow": {"pm25": 130, "pm10": 200, "no2": 55, "so2": 22, "co": 2.2, "o3": 35},
        "kanpur": {"pm25": 140, "pm10": 210, "no2": 58, "so2": 25, "co": 2.3, "o3": 33},
        "nagpur": {"pm25": 70, "pm10": 110, "no2": 35, "so2": 13, "co": 1.4, "o3": 41},
        "patna": {"pm25": 150, "pm10": 220, "no2": 52, "so2": 20, "co": 2.4, "o3": 32},
        "indore": {"pm25": 75, "pm10": 115, "no2": 36, "so2": 14, "co": 1.5, "o3": 40},
        "bhopal": {"pm25": 80, "pm10": 125, "no2": 38, "so2": 15, "co": 1.6, "o3": 39},
        "visakhapatnam": {"pm25": 45, "pm10": 70, "no2": 28, "so2": 10, "co": 1.1, "o3": 46},
        "vadodara": {"pm25": 85, "pm10": 130, "no2": 40, "so2": 16, "co": 1.7, "o3": 37},
        "guwahati": {"pm25": 55, "pm10": 85, "no2": 30, "so2": 11, "co": 1.2, "o3": 44},
        "chandigarh": {"pm25": 75, "pm10": 120, "no2": 38, "so2": 14, "co": 1.5, "o3": 41},
        "thiruvananthapuram": {"pm25": 30, "pm10": 50, "no2": 20, "so2": 8, "co": 0.8, "o3": 48},
    }
    
    baseline = baselines.get(city_id, {"pm25": 70, "pm10": 100, "no2": 35, "so2": 14, "co": 1.5, "o3": 40})
    
    # Use a fixed random seed per city+hour so values are stable within the same hour
    now = datetime.utcnow()
    seed = hash(city_id + now.strftime("%Y-%m-%d-%H"))
    rng = random.Random(seed)
    
    # Add time-based variation (higher pollution at night/morning)
    hour = now.hour
    time_factor = 1.0
    if 6 <= hour <= 10:
        time_factor = 1.3  # Morning rush
    elif 17 <= hour <= 21:
        time_factor = 1.2  # Evening rush
    elif 0 <= hour <= 5:
        time_factor = 0.8  # Early morning
    
    # Add random variation (±20%)
    pollutants = {}
    for key, base_val in baseline.items():
        variation = rng.uniform(0.8, 1.2)
        pollutants[key] = round(base_val * time_factor * variation, 1)
    
    return pollutants


def generate_synthetic_weather(lat: float, city_id: str = "default") -> Dict:
    """Generate synthetic weather data."""
    # Temperature varies with latitude (north India cooler)
    base_temp = 35 - (lat - 8) * 0.5
    
    now = datetime.utcnow()
    seed = hash("weather" + city_id + now.strftime("%Y-%m-%d-%H"))
    rng = random.Random(seed)
    
    hour = now.hour
    temp_variation = -5 if hour < 6 or hour > 20 else 3
    
    return {
        "temperature": round(base_temp + temp_variation + rng.uniform(-3, 3), 1),
        "humidity": round(rng.uniform(40, 80), 1),
        "wind_speed": round(rng.uniform(2, 15), 1),
        "wind_direction": round(rng.uniform(0, 360)),
        "weather_code": rng.choice([0, 1, 2, 3, 45, 61]),
        "pressure": round(rng.uniform(1005, 1020), 1),
    }


def generate_synthetic_history(city_id: str, hours: int = 168) -> List[Dict]:
    """Generate synthetic historical AQI data for charts."""
    baseline = generate_synthetic_aqi_data(city_id)
    history = []
    now = datetime.utcnow()
    
    for i in range(hours, 0, -1):
        timestamp = now - timedelta(hours=i)
        hour = timestamp.hour
        
        # Time-of-day factor
        if 6 <= hour <= 10:
            factor = 1.3
        elif 17 <= hour <= 21:
            factor = 1.2
        elif 0 <= hour <= 5:
            factor = 0.8
        else:
            factor = 1.0
        
        # Day-of-week factor (weekends slightly lower)
        if timestamp.weekday() >= 5:
            factor *= 0.9
        
        point = {
            "timestamp": timestamp.isoformat(),
            "pollutants": {}
        }
        
        for key, base_val in baseline.items():
            variation = random.uniform(0.7, 1.3)
            point["pollutants"][key] = round(base_val * factor * variation, 1)
        
        from .aqi_calculator import calculate_aqi
        aqi_result = calculate_aqi(point["pollutants"])
        point["aqi"] = aqi_result["aqi"]
        point["category"] = aqi_result["category"]
        
        history.append(point)
    
    return history


def generate_synthetic_forecast(city_id: str, hours: int = 48, model: str = "ensemble") -> List[Dict]:
    """Generate synthetic forecast data."""
    baseline = generate_synthetic_aqi_data(city_id)
    forecast = []
    
    now = datetime.utcnow()
    # Use different seeds for different models so they produce distinct but consistent predictions
    seed = hash(city_id + model + now.strftime("%Y-%m-%d-%H"))
    rng = random.Random(seed)
    
    # Simulate a trend (slight improvement or decline)
    trend = rng.choice([-0.005, 0, 0.003, -0.003])
    
    # Model-specific variations
    model_lower = model.lower()
    if model_lower == "randomforest":
        noise_level = 0.15 # more noise
        trend *= 1.2
    elif model_lower == "gradientboosting":
        noise_level = 0.08 # less noise
        trend *= 0.8
    elif model_lower == "lstm":
        noise_level = 0.05 # very smooth
        trend *= 1.5
    else:
        noise_level = 0.10
        
    for i in range(hours):
        timestamp = now + timedelta(hours=i)
        hour = timestamp.hour
        
        # Base daily pattern (smooth sine wave peaking around 8 AM and 8 PM)
        # Shifted so peak is around morning rush and evening
        day_progression = (hour / 24.0) * 2 * math.pi
        daily_cycle = 1.0 + 0.3 * math.sin(day_progression - math.pi/4) + 0.2 * math.sin(2 * day_progression)
        
        # Apply trend
        trend_factor = 1.0 + (trend * i)
        
        point = {
            "timestamp": timestamp.isoformat(),
            "pollutants": {},
        }
        
        for key, base_val in baseline.items():
            if model_lower == "lstm":
                # LSTM: highly smooth autoregressive pattern, capturing the exact daily cycle with minimal noise
                variation = rng.uniform(0.98, 1.02)
                val = base_val * daily_cycle * trend_factor * variation
            
            elif model_lower == "gradientboosting":
                # Gradient Boosting: Sharp tracking, high-frequency corrections. Noticeable jaggedness but accurate bounds.
                # It heavily reacts to the time block
                block_noise = rng.uniform(0.85, 1.15) if i % 2 == 0 else rng.uniform(0.95, 1.05)
                val = base_val * daily_cycle * trend_factor * block_noise
            
            else: # RandomForest
                # Random Forest: Ensemble tree steps. Holds values steady for small blocks of time, then jumps.
                # Seed the noise block based on i // 4 (every 4 hours it creates a new "leaf" prediction)
                leaf_seed = hash(f"{seed}-{key}-{i // 4}")
                leaf_rng = random.Random(leaf_seed)
                leaf_val = leaf_rng.uniform(0.8, 1.2)
                
                # Add slight jitters within the leaf to not look perfectly horizontal
                jitter = rng.uniform(0.97, 1.03)
                val = base_val * daily_cycle * trend_factor * leaf_val * jitter

            point["pollutants"][key] = round(max(0, val), 1)
        
        from .aqi_calculator import calculate_aqi
        aqi_result = calculate_aqi(point["pollutants"])
        point["aqi"] = aqi_result["aqi"]
        point["category"] = aqi_result["category"]
        point["color"] = aqi_result["color"]
        
        # Confidence decreases with time, vary slightly by model
        if model_lower == "lstm":
            base_conf, drop_rate = 0.98, 0.005 # holds confidence well
        elif model_lower == "gradientboosting":
            base_conf, drop_rate = 0.95, 0.008
        else:
            base_conf, drop_rate = 0.92, 0.010
            
        point["confidence"] = round(max(0.4, base_conf - (i * drop_rate)), 2)
        
        forecast.append(point)
    
    return forecast
