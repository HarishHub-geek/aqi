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


import httpx

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://ml:8000")

@router.get("/forecast/{city_id}")
async def get_aqi_forecast(city_id: str, hours: int = 48, model: str = "RandomForest"):
    """Get AQI forecast for a city (default: 48 hours)."""
    city = get_city_by_id(city_id)
    if not city:
        return {"error": "City not found"}
    
    forecast = None
    
    # Try to fetch from the actual ML service
    try:
        if ML_SERVICE_URL:
            async with httpx.AsyncClient() as client:
                res = await client.get(f"{ML_SERVICE_URL}/predict/{city_id}?hours={hours}", timeout=10.0)
                if res.status_code == 200:
                    data = res.json()
                    # The ML Service returns the array of predictions inside the "forecast" key
                    forecast = data.get("forecast")
    except Exception as e:
        print(f"Failed to fetch forecast from ML service: {e}")

    # Fallback to synthetic if ML service is down or not configured
    if not forecast:
        forecast = generate_synthetic_forecast(city_id, hours, model=model)
    
    return {
        "city": city,
        "hours": hours,
        "count": len(forecast),
        "model": model,
        "data": forecast,
    }
