"""
Cities API routes.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from fastapi import APIRouter
from packages.config.cities import get_all_cities, get_city_by_id

router = APIRouter(prefix="/api", tags=["cities"])


@router.get("/cities")
async def list_cities():
    """List all monitored Indian cities."""
    cities = get_all_cities()
    return {
        "count": len(cities),
        "cities": cities,
    }


@router.get("/cities/{city_id}")
async def get_city(city_id: str):
    """Get details for a specific city."""
    city = get_city_by_id(city_id)
    if not city:
        return {"error": "City not found"}, 404
    return city
