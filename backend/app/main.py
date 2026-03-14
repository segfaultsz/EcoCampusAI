"""
EcoCampus AI - FastAPI Backend
================================
Main application entry point. Serves AI/ML prediction endpoints.
"""

import os
import sys
import json
import traceback
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Add parent dirs to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.models.prophet_model import EnergyForecaster
from app.models.anomaly_model import AnomalyDetector
from app.models.recommender import RecommendationEngine
from app.services import data_service
from app.services.carbon_calc import co2_equivalences, calculate_sustainability_score, kwh_to_co2
from app.schemas.prediction import (
    PredictionRequest, PeakPredictionRequest,
    AnomalyDetectionRequest, SimulationRequest,
    RecommendationRequest,
)

# ============================================
# Global model instances
# ============================================
forecaster = EnergyForecaster(model_dir=os.path.join(os.path.dirname(__file__), "..", "trained_models"))
anomaly_detector = AnomalyDetector(contamination=0.05)
recommender = RecommendationEngine()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup."""
    print("Loading saved models...")
    forecaster.load_all_models()
    print(f"  Loaded {len(forecaster.models) + len(forecaster.stats)} forecasting models")
    yield
    print("Shutting down...")


app = FastAPI(
    title="EcoCampus AI - ML API",
    description="AI/ML endpoints for campus energy prediction, anomaly detection, and optimization",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# Health & Status
# ============================================

@app.get("/")
async def root():
    return {"status": "ok", "service": "EcoCampus AI ML API"}


@app.get("/model/status")
async def model_status():
    """Get status of all loaded models."""
    return {
        "forecasting_models": len(forecaster.models) + len(forecaster.stats),
        "prophet_models": len(forecaster.models),
        "fallback_models": len(forecaster.stats),
        "anomaly_baselines": len(anomaly_detector.baselines),
        "anomaly_sklearn_models": len(anomaly_detector.models),
    }


# ============================================
# Training Endpoints
# ============================================

@app.post("/train/all")
async def train_all_models():
    """Train forecasting and anomaly models for all buildings."""
    try:
        buildings = data_service.get_buildings()
        results = {"forecasting": [], "anomaly_detection": []}

        for building in buildings:
            bid = building["id"]
            print(f"Training models for {building['name']}...")

            # Get energy data
            energy_df = data_service.get_energy_readings(bid)
            if energy_df.empty:
                continue

            # Train forecaster
            forecast_result = forecaster.train(bid, energy_df)
            results["forecasting"].append(forecast_result)

            # Train anomaly detector
            anomaly_result = anomaly_detector.train(bid, energy_df)
            results["anomaly_detection"].append(anomaly_result)

        return {
            "status": "success",
            "buildings_trained": len(buildings),
            "results": results,
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/train/{building_id}")
async def train_building(building_id: str):
    """Train models for a specific building."""
    try:
        energy_df = data_service.get_energy_readings(building_id)
        if energy_df.empty:
            raise HTTPException(status_code=404, detail="No energy data found")

        forecast_result = forecaster.train(building_id, energy_df)
        anomaly_result = anomaly_detector.train(building_id, energy_df)

        return {
            "status": "success",
            "forecasting": forecast_result,
            "anomaly_detection": anomaly_result,
        }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Prediction Endpoints
# ============================================

@app.post("/predict/energy")
async def predict_energy(req: PredictionRequest):
    """Predict energy consumption for next N days."""
    try:
        result = forecaster.predict(req.building_id, req.days)
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return result

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/peak")
async def predict_peak(req: PeakPredictionRequest):
    """Predict next peak usage period."""
    try:
        result = forecaster.predict(req.building_id, 7)
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])

        # Find peaks in predictions
        peaks = [p for p in result["predictions"] if p["is_peak_predicted"]]

        next_peak = peaks[0] if peaks else None

        return {
            "building_id": req.building_id,
            "next_peak": next_peak,
            "upcoming_peaks": peaks[:5],
            "total_peaks_in_week": len(peaks),
        }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Anomaly Detection Endpoints
# ============================================

@app.post("/detect/anomalies")
async def detect_anomalies(req: AnomalyDetectionRequest):
    """Run anomaly detection on recent data."""
    try:
        recent = data_service.get_recent_energy(req.building_id, req.hours)
        if recent.empty:
            return {"building_id": req.building_id, "anomalies": [], "count": 0}

        anomalies = anomaly_detector.detect(req.building_id, recent)

        return {
            "building_id": req.building_id,
            "period_hours": req.hours,
            "data_points_analyzed": len(recent),
            "anomalies": anomalies,
            "count": len(anomalies),
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Recommendation Endpoints
# ============================================

@app.post("/recommend")
async def generate_recommendations(req: RecommendationRequest):
    """Generate AI optimization recommendations."""
    try:
        buildings = data_service.get_buildings()

        if req.building_id:
            buildings = [b for b in buildings if b["id"] == req.building_id]
            if not buildings:
                raise HTTPException(status_code=404, detail="Building not found")

        # Calculate campus average kWh/sqft
        all_energy = data_service.get_energy_readings()
        if not all_energy.empty:
            all_energy["date"] = all_energy["timestamp"].str[:10]
            daily = all_energy.groupby("date")["consumption_kwh"].sum().mean()
            total_sqft = sum(b.get("area_sqft", 0) for b in data_service.get_buildings())
            campus_avg = daily / total_sqft if total_sqft > 0 else None
        else:
            campus_avg = None

        all_recommendations = []

        for building in buildings:
            bid = building["id"]
            energy = data_service.get_energy_readings(bid)
            waste = data_service.get_waste_records(bid)

            recs = recommender.analyze_building(
                building, energy,
                waste_data=waste if not waste.empty else None,
                campus_avg_kwh_per_sqft=campus_avg,
            )

            for rec in recs:
                rec["building_id"] = bid
                rec["building_name"] = building["name"]

            all_recommendations.extend(recs)

        return {
            "recommendations": all_recommendations,
            "count": len(all_recommendations),
            "total_potential_savings": round(sum(r.get("estimated_savings_monthly", 0) for r in all_recommendations), 2),
        }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Simulation Endpoints
# ============================================

@app.post("/simulate")
async def simulate_what_if(req: SimulationRequest):
    """Run a what-if energy simulation."""
    try:
        energy = data_service.get_energy_readings(req.building_id)
        if energy.empty:
            raise HTTPException(status_code=404, detail="No energy data found")

        scenario = {}
        if req.ac_shutdown_hour is not None:
            scenario["ac_shutdown_hour"] = req.ac_shutdown_hour
        if req.lighting_reduction_pct is not None:
            scenario["lighting_reduction_pct"] = req.lighting_reduction_pct
        if req.weekend_shutdown is not None:
            scenario["weekend_shutdown"] = req.weekend_shutdown
        if req.setpoint_increase_c is not None:
            scenario["setpoint_increase_c"] = req.setpoint_increase_c

        if not scenario:
            raise HTTPException(status_code=400, detail="At least one scenario parameter required")

        result = recommender.simulate_what_if(energy, scenario)
        result["building_id"] = req.building_id

        return result

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Carbon & Sustainability
# ============================================

@app.get("/carbon/equivalences/{co2_kg}")
async def get_carbon_equivalences(co2_kg: float):
    """Get carbon equivalences for a given CO2 amount."""
    return co2_equivalences(co2_kg)


@app.get("/sustainability/score/{building_id}")
async def get_sustainability_score(building_id: str):
    """Calculate sustainability score for a building."""
    try:
        building = data_service.get_building(building_id)
        if not building:
            raise HTTPException(status_code=404, detail="Building not found")

        energy = data_service.get_energy_readings(building_id)
        waste = data_service.get_waste_records(building_id)

        # Energy efficiency ratio
        if not energy.empty and building.get("area_sqft", 0) > 0:
            energy["date"] = energy["timestamp"].str[:10]
            daily_avg = energy.groupby("date")["consumption_kwh"].sum().mean()
            building_kwh_sqft = daily_avg / building["area_sqft"]

            all_buildings = data_service.get_buildings()
            total_sqft = sum(b.get("area_sqft", 0) for b in all_buildings)
            all_energy = data_service.get_energy_readings()
            if not all_energy.empty:
                all_energy["date"] = all_energy["timestamp"].str[:10]
                campus_daily = all_energy.groupby("date")["consumption_kwh"].sum().mean()
                campus_avg = campus_daily / total_sqft
                efficiency_ratio = building_kwh_sqft / campus_avg if campus_avg > 0 else 1.0
            else:
                efficiency_ratio = 1.0
        else:
            efficiency_ratio = 1.0

        # Waste diversion rate
        if not waste.empty:
            total_waste = (waste["organic_kg"] + waste["recyclable_kg"] + waste["ewaste_kg"] + waste["general_kg"]).sum()
            diverted = (waste["organic_kg"] + waste["recyclable_kg"]).sum()
            diversion_rate = diverted / total_waste if total_waste > 0 else 0
        else:
            diversion_rate = 0.5

        # Anomaly rate (simplified)
        anomaly_rate = 3.0  # Default moderate rate

        # Recommendation adoption (from DB)
        adoption_rate = 0.4  # Default

        score = calculate_sustainability_score(
            efficiency_ratio, diversion_rate, anomaly_rate, adoption_rate
        )
        score["building_id"] = building_id
        score["building_name"] = building["name"]

        return score

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


from app.routers import real_data
app.include_router(real_data.router)

# ============================================
# Entry point
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
