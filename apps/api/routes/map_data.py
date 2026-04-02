"""
Map data API routes - GeoJSON for map visualization.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from fastapi import APIRouter
from packages.config.cities import get_all_cities
from ..aqi_calculator import calculate_aqi
from ..data_sources import generate_synthetic_aqi_data, fetch_openaq_data

router = APIRouter(prefix="/api", tags=["map"])


@router.get("/map")
async def get_map_data():
    """Get GeoJSON data for all cities with AQI markers."""
    cities = get_all_cities()
    features = []
    
    for city in cities:
        # Try real data, fall back to synthetic
        pollutants = await fetch_openaq_data(city["lat"], city["lon"])
        if not pollutants:
            pollutants = generate_synthetic_aqi_data(city["id"])
        
        aqi_result = calculate_aqi(pollutants)
        
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [city["lon"], city["lat"]],
            },
            "properties": {
                "id": city["id"],
                "name": city["name"],
                "state": city["state"],
                "aqi": aqi_result["aqi"],
                "category": aqi_result["category"],
                "color": aqi_result["color"],
                "dominant_pollutant": aqi_result["dominant_pollutant"],
                "population": city.get("population"),
            },
        }
        features.append(feature)
    
    return {
        "type": "FeatureCollection",
        "features": features,
    }
