"""
AQI data API routes - current readings and historical data.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from fastapi import APIRouter, Query
from packages.config.cities import get_all_cities, get_city_by_id
from ..aqi_calculator import calculate_aqi, POLLUTANT_INFO
from ..data_sources import (
    fetch_openaq_data,
    fetch_weather_data,
    generate_synthetic_aqi_data,
    generate_synthetic_weather,
    generate_synthetic_history,
)
from ..cache import cached
from packages.utils.database import get_historical_measurements

router = APIRouter(prefix="/api/aqi", tags=["aqi"])


@router.get("/current/{city_id}")
async def get_current_aqi(city_id: str):
    """Get current AQI data for a city."""
    city = get_city_by_id(city_id)
    if not city:
        return {"error": "City not found"}
    
    # Try real data first, fall back to synthetic
    pollutants = await fetch_openaq_data(city_id, city["lat"], city["lon"])
    if not pollutants:
        pollutants = generate_synthetic_aqi_data(city_id)
    
    weather = await fetch_weather_data(city["lat"], city["lon"])
    if not weather:
        weather = generate_synthetic_weather(city["lat"])
    
    aqi_result = calculate_aqi(pollutants)
    
    return {
        "city": city,
        "aqi": aqi_result,
        "pollutants": pollutants,
        "pollutant_info": POLLUTANT_INFO,
        "weather": weather,
        "data_source": "openaq" if pollutants else "synthetic",
    }


@router.get("/current")
async def get_all_current_aqi():
    """Get current AQI for all cities."""
    cities = get_all_cities()
    results = []
    
    for city in cities:
        pollutants = await fetch_openaq_data(city["id"], city["lat"], city["lon"])
        if not pollutants:
            pollutants = generate_synthetic_aqi_data(city["id"])
        
        aqi_result = calculate_aqi(pollutants)
        
        results.append({
            "city": city,
            "aqi": aqi_result["aqi"],
            "category": aqi_result["category"],
            "color": aqi_result["color"],
            "dominant_pollutant": aqi_result["dominant_pollutant"],
        })
    
    # Sort by AQI descending
    results.sort(key=lambda x: x["aqi"], reverse=True)
    
    return {
        "count": len(results),
        "data": results,
    }


@router.get("/history/{city_id}")
async def get_aqi_history(
    city_id: str,
    hours: int = Query(default=168, ge=1, le=2160),
):
    """Get historical AQI data for a city (default: 7 days)."""
    city = get_city_by_id(city_id)
    if not city:
        return {"error": "City not found"}
    
    # Try database first
    history = get_historical_measurements(city_id, hours)
    
    # If no data in DB, fall back to synthetic
    if not history:
        history = generate_synthetic_history(city_id, hours)
    else:
        # Convert DB records to the format expected by frontend
        formatted_history = []
        for row in history:
            formatted_history.append({
                "timestamp": row["timestamp"].isoformat(),
                "aqi": row["aqi"],
                "category": row["category"],
                "pollutants": {
                    "pm25": row["pm25"],
                    "pm10": row["pm10"],
                    "no2": row["no2"],
                    "so2": row["so2"],
                    "co": row["co"],
                    "o3": row["o3"],
                }
            })
        history = formatted_history
    
    return {
        "city": city,
        "hours": hours,
        "count": len(history),
        "data": history,
    }
