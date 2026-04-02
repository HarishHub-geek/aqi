"""
ML Model Serving API.
FastAPI service that exposes trained models for prediction requests.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .pipeline import pipeline
from packages.utils.database import save_forecast

app = FastAPI(
    title="AQI ML Service",
    description="ML model serving for AQI predictions",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_train():
    """Train models on startup."""
    try:
        pipeline.train("delhi", n_hours=720)  # 30 days for faster startup
    except Exception as e:
        print(f"Training error (non-critical): {e}")


@app.get("/")
async def root():
    return {
        "service": "AQI ML Service",
        "status": "trained" if pipeline.is_trained else "untrained",
        "metrics": pipeline.metrics,
    }


@app.get("/predict/{city_id}")
async def predict(city_id: str, hours: int = 48):
    """Generate forecast for a city."""
    forecast = pipeline.predict_forecast(city_id, hours)
    
    # Save forecast to database
    try:
        for point in forecast:
            save_forecast(
                city_id=city_id,
                timestamp=point.get("timestamp"),
                predicted_aqi=point.get("aqi"),
                model=point.get("model", "RandomForest"),
                confidence=point.get("confidence", 0.9)
            )
    except Exception as db_e:
        print(f"Failed to save forecast to DB: {db_e}")
        
    return {
        "city_id": city_id,
        "hours": hours,
        "model_status": "trained" if pipeline.is_trained else "baseline",
        "metrics": pipeline.metrics,
        "forecast": forecast,
    }


@app.post("/train/{city_id}")
async def train_model(city_id: str, hours: int = 2160):
    """Trigger model training."""
    metrics = pipeline.train(city_id, hours)
    return {
        "status": "trained",
        "metrics": metrics,
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "model_trained": pipeline.is_trained}
