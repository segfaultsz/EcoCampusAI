from fastapi import APIRouter, HTTPException, Query
from services.real_data_service import (
    get_current_solar, fetch_live_solar,
    get_current_aqi,   fetch_aqi,
    get_sunrise_sunset, get_config,
    fetch_historical_weather
)

router = APIRouter(prefix="/api/real", tags=["real-data"])


@router.get("/solar/current")
async def current_solar():
    data = await get_current_solar()
    if not data:
        raise HTTPException(503, "Solar data unavailable")
    return data


@router.post("/solar/refresh")
async def refresh_solar():
    rows = await fetch_live_solar()
    return {"upserted": len(rows)}


@router.get("/aqi/current")
async def current_aqi():
    data = await get_current_aqi()
    if not data:
        raise HTTPException(503, "AQI data unavailable — check DATA_GOV_IN_KEY env var")
    return data


@router.get("/sunrise-sunset")
async def sunrise_sunset(date: str = Query(None, description="YYYY-MM-DD, default today")):
    return await get_sunrise_sunset(date)


@router.get("/config/{key}")
async def app_config(key: str):
    value = await get_config(key)
    if not value:
        raise HTTPException(404, f"Config key '{key}' not found")
    return {"key": key, "value": value}


@router.get("/weather/historical")
async def historical_weather(
    start: str = Query(..., description="YYYY-MM-DD"),
    end:   str = Query(..., description="YYYY-MM-DD")
):
    rows = await fetch_historical_weather(start, end)
    return {"count": len(rows), "rows": rows[:48]}