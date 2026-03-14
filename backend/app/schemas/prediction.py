"""Pydantic schemas for API request/response validation."""

from pydantic import BaseModel, Field
from typing import Optional


class PredictionRequest(BaseModel):
    building_id: str
    days: int = Field(default=7, ge=1, le=30)


class PeakPredictionRequest(BaseModel):
    building_id: str


class AnomalyDetectionRequest(BaseModel):
    building_id: str
    hours: int = Field(default=48, ge=1, le=168)


class SimulationRequest(BaseModel):
    building_id: str
    ac_shutdown_hour: Optional[int] = Field(default=None, ge=0, le=23)
    lighting_reduction_pct: Optional[float] = Field(default=None, ge=0, le=100)
    weekend_shutdown: Optional[bool] = None
    setpoint_increase_c: Optional[float] = Field(default=None, ge=0, le=5)


class RecommendationRequest(BaseModel):
    building_id: Optional[str] = None
