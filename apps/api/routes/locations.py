"""
City locations and hourly history API routes.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from fastapi import APIRouter, Query
from packages.config.cities import get_city_by_id
from ..locations import generate_location_data, generate_hourly_history

router = APIRouter(prefix="/api", tags=["locations"])


@router.get("/locations/{city_id}")
async def get_city_locations(city_id: str):
    """Get all monitoring stations/locations within a city with their AQI data."""
    city = get_city_by_id(city_id)
    if not city:
        return {"error": "City not found"}

    locations = generate_location_data(city_id)

    return {
        "city": city,
        "count": len(locations),
        "locations": locations,
    }


@router.get("/hourly-history/{city_id}")
async def get_hourly_history(
    city_id: str,
    hours: int = Query(default=24, ge=1, le=48),
):
    """Get hourly AQI data for the past N hours (like the bar chart reference)."""
    city = get_city_by_id(city_id)
    if not city:
        return {"error": "City not found"}

    history = generate_hourly_history(city_id, hours)
    history["city"] = city

    return history
