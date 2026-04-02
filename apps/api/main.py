"""
FastAPI Application - AQI Intelligence Platform API
"""
import sys
import os

# Add project root to path for package imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.cities import router as cities_router
from .routes.aqi import router as aqi_router
from .routes.forecast import router as forecast_router
from .routes.map_data import router as map_router
from .routes.locations import router as locations_router

app = FastAPI(
    title="AQI Intelligence Platform API",
    description="Real-time Air Quality Intelligence for India with ML-powered forecasting",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(cities_router)
app.include_router(aqi_router)
app.include_router(forecast_router)
app.include_router(map_router)
app.include_router(locations_router)


@app.get("/")
async def root():
    return {
        "name": "AQI Intelligence Platform API",
        "version": "1.0.0",
        "description": "Real-time AQI monitoring and forecasting for India",
        "endpoints": {
            "cities": "/api/cities",
            "current_aqi": "/api/aqi/current",
            "city_aqi": "/api/aqi/current/{city_id}",
            "history": "/api/aqi/history/{city_id}",
            "forecast": "/api/aqi/forecast/{city_id}",
            "map": "/api/map",
            "docs": "/docs",
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
