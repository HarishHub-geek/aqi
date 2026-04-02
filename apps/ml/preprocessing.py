"""
Data preprocessing and feature engineering for AQI prediction.
"""

import numpy as np
from datetime import datetime
from typing import Dict, List, Tuple


def create_time_features(timestamps: List[str]) -> np.ndarray:
    """
    Create time-based features from timestamps.
    Returns: hour, day_of_week, month, is_weekend, hour_sin, hour_cos
    """
    features = []
    
    for ts in timestamps:
        if isinstance(ts, str):
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        else:
            dt = ts
        
        hour = dt.hour
        day_of_week = dt.weekday()
        month = dt.month
        is_weekend = 1 if day_of_week >= 5 else 0
        
        # Cyclical encoding for hour and day
        hour_sin = np.sin(2 * np.pi * hour / 24)
        hour_cos = np.cos(2 * np.pi * hour / 24)
        day_sin = np.sin(2 * np.pi * day_of_week / 7)
        day_cos = np.cos(2 * np.pi * day_of_week / 7)
        month_sin = np.sin(2 * np.pi * month / 12)
        month_cos = np.cos(2 * np.pi * month / 12)
        
        features.append([
            hour, day_of_week, month, is_weekend,
            hour_sin, hour_cos, day_sin, day_cos,
            month_sin, month_cos,
        ])
    
    return np.array(features)


def create_pollutant_features(data: List[Dict]) -> np.ndarray:
    """
    Extract pollutant concentration features.
    """
    pollutant_keys = ["pm25", "pm10", "no2", "so2", "co", "o3"]
    features = []
    
    for point in data:
        pollutants = point.get("pollutants", point)
        values = []
        for key in pollutant_keys:
            val = pollutants.get(key, 0)
            values.append(val if val is not None else 0)
        features.append(values)
    
    return np.array(features)


def create_weather_features(weather_data: List[Dict]) -> np.ndarray:
    """
    Extract weather features: temperature, humidity, wind_speed, wind_direction.
    """
    features = []
    
    for point in weather_data:
        temp = point.get("temperature", 25)
        humidity = point.get("humidity", 50)
        wind_speed = point.get("wind_speed", 5)
        wind_dir = point.get("wind_direction", 180)
        pressure = point.get("pressure", 1013)
        
        # Cyclical encoding for wind direction
        wind_sin = np.sin(2 * np.pi * wind_dir / 360)
        wind_cos = np.cos(2 * np.pi * wind_dir / 360)
        
        features.append([
            temp, humidity, wind_speed, wind_sin, wind_cos, pressure,
        ])
    
    return np.array(features)


def create_lag_features(values: np.ndarray, lags: List[int] = [1, 3, 6, 12, 24]) -> np.ndarray:
    """
    Create lag features for time series.
    """
    n = len(values)
    features = np.zeros((n, len(lags)))
    
    for j, lag in enumerate(lags):
        for i in range(n):
            if i >= lag:
                features[i, j] = values[i - lag]
            else:
                features[i, j] = values[0]
    
    return features


def create_rolling_features(values: np.ndarray, windows: List[int] = [3, 6, 12, 24]) -> np.ndarray:
    """
    Create rolling mean and std features.
    """
    n = len(values)
    features = np.zeros((n, len(windows) * 2))
    
    for j, window in enumerate(windows):
        for i in range(n):
            start = max(0, i - window + 1)
            window_vals = values[start:i+1]
            features[i, j * 2] = np.mean(window_vals)
            features[i, j * 2 + 1] = np.std(window_vals) if len(window_vals) > 1 else 0
    
    return features


def build_feature_matrix(
    timestamps: List[str],
    pollutant_data: List[Dict],
    weather_data: List[Dict],
    target_pollutant: str = "pm25",
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Build complete feature matrix for training.
    
    Returns:
        X: Feature matrix (n_samples, n_features)
        y: Target values (AQI)
    """
    # Time features
    time_feats = create_time_features(timestamps)
    
    # Pollutant features
    poll_feats = create_pollutant_features(pollutant_data)
    
    # Weather features
    weather_feats = create_weather_features(weather_data)
    
    # Target: AQI values 
    from .models import AQIRandomForest  # avoid circular
    pollutant_keys = ["pm25", "pm10", "no2", "so2", "co", "o3"]
    
    # Calculate AQI for each data point as target
    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
    from apps.api.aqi_calculator import calculate_aqi
    
    y = []
    for point in pollutant_data:
        pollutants = point.get("pollutants", point)
        aqi_result = calculate_aqi(pollutants)
        y.append(aqi_result["aqi"])
    y = np.array(y, dtype=float)
    
    # Lag features on target
    lag_feats = create_lag_features(y)
    
    # Rolling features on target
    roll_feats = create_rolling_features(y)
    
    # Concatenate all features
    X = np.hstack([time_feats, poll_feats, weather_feats, lag_feats, roll_feats])
    
    return X, y


def generate_synthetic_training_data(city_id: str, n_hours: int = 2160) -> Tuple[List[str], List[Dict], List[Dict]]:
    """
    Generate synthetic training data for a city (default: 90 days).
    """
    import random
    from datetime import timedelta
    
    # City baselines
    baselines = {
        "delhi": {"pm25": 180, "pm10": 250, "no2": 60, "so2": 20, "co": 2.5, "o3": 40},
        "mumbai": {"pm25": 80, "pm10": 120, "no2": 45, "so2": 15, "co": 1.8, "o3": 35},
        "bangalore": {"pm25": 55, "pm10": 90, "no2": 35, "so2": 12, "co": 1.3, "o3": 42},
    }
    baseline = baselines.get(city_id, {"pm25": 70, "pm10": 100, "no2": 35, "so2": 14, "co": 1.5, "o3": 40})
    
    timestamps = []
    pollutant_data = []
    weather_data = []
    
    now = datetime.utcnow()
    
    for i in range(n_hours, 0, -1):
        ts = now - timedelta(hours=i)
        timestamps.append(ts.isoformat())
        
        hour = ts.hour
        # Time variation
        if 6 <= hour <= 10:
            factor = 1.3
        elif 17 <= hour <= 21:
            factor = 1.2
        elif 0 <= hour <= 5:
            factor = 0.8
        else:
            factor = 1.0
        
        # Weekend factor
        if ts.weekday() >= 5:
            factor *= 0.9
        
        # Seasonal variation (winter worse)
        month = ts.month
        if month in [11, 12, 1, 2]:
            factor *= 1.4
        elif month in [6, 7, 8]:
            factor *= 0.7
        
        pollutants = {}
        for key, base_val in baseline.items():
            variation = random.gauss(1.0, 0.15)
            pollutants[key] = round(max(0, base_val * factor * variation), 1)
        
        pollutant_data.append({"pollutants": pollutants})
        
        # Weather
        base_temp = 30 - abs(month - 6) * 2
        weather_data.append({
            "temperature": round(base_temp + random.gauss(0, 3), 1),
            "humidity": round(max(20, min(95, 60 + random.gauss(0, 15))), 1),
            "wind_speed": round(max(0, random.gauss(8, 4)), 1),
            "wind_direction": round(random.uniform(0, 360)),
            "pressure": round(random.gauss(1013, 5), 1),
        })
    
    return timestamps, pollutant_data, weather_data
