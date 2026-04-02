"""
AQI forecast API routes.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from fastapi import APIRouter
from packages.config.cities import get_city_by_id
from ..data_sources import generate_synthetic_forecast

router = APIRouter(prefix="/api/aqi", tags=["forecast"])


@router.get("/forecast/{city_id}")
async def get_aqi_forecast(city_id: str, hours: int = 48, model: str = "RandomForest"):
    """Get AQI forecast for a city (default: 48 hours)."""
    city = get_city_by_id(city_id)
    if not city:
        return {"error": "City not found"}
    
    forecast = generate_synthetic_forecast(city_id, hours, model=model)
    
    return {
        "city": city,
        "hours": hours,
        "count": len(forecast),
        "model": model,
        "data": forecast,
    }
