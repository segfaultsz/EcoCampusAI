"""
EcoCampus AI - Synthetic Data Generator
========================================
Generates 6 months of realistic campus energy and waste data with:
- Hourly energy readings per building (with daily/weekly seasonality)
- Daily waste records per building
- Injected anomalies (equipment faults, events, after-hours usage)
- Carbon footprint daily aggregates
- Pre-seeded recommendations
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
import os
import sys

# Seed for reproducibility
np.random.seed(42)

# ============================================
# CAMPUS CONFIGURATION
# ============================================

BUILDINGS = [
    {"name": "Lecture Hall Complex", "code": "LHC", "type": "academic", "area_sqft": 18000, "floors": 4, "has_ac": True, "base_kwh": 315, "peak_factor": 1.3},
    {"name": "Galleria", "code": "GAL", "type": "amenity", "area_sqft": 10000, "floors": 2, "has_ac": True, "base_kwh": 215, "peak_factor": 1.35},
    {"name": "Atrium", "code": "ATR", "type": "admin", "area_sqft": 9000, "floors": 3, "has_ac": True, "base_kwh": 175, "peak_factor": 1.1},
    {"name": "Core", "code": "COR", "type": "academic", "area_sqft": 14000, "floors": 3, "has_ac": True, "base_kwh": 295, "peak_factor": 1.3},
    {"name": "Tifac", "code": "TIF", "type": "lab", "area_sqft": 12000, "floors": 2, "has_ac": True, "base_kwh": 350, "peak_factor": 1.4},
    {"name": "Indoor Stadium", "code": "STD", "type": "amenity", "area_sqft": 30000, "floors": 1, "has_ac": False, "base_kwh": 100, "peak_factor": 1.1},
    {"name": "Boys Hostel 1", "code": "BH1", "type": "hostel", "area_sqft": 25000, "floors": 5, "has_ac": False, "base_kwh": 240, "peak_factor": 1.2},
    {"name": "Boys Hostel 2", "code": "BH2", "type": "hostel", "area_sqft": 22000, "floors": 5, "has_ac": False, "base_kwh": 220, "peak_factor": 1.15},
    {"name": "Girls Hostel", "code": "GH1", "type": "hostel", "area_sqft": 22000, "floors": 5, "has_ac": False, "base_kwh": 220, "peak_factor": 1.15},
    {"name": "Mechanical Workshop", "code": "MWS", "type": "lab", "area_sqft": 18000, "floors": 2, "has_ac": False, "base_kwh": 450, "peak_factor": 1.4},
    {"name": "Octagon", "code": "OCT", "type": "amenity", "area_sqft": 15000, "floors": 2, "has_ac": True, "base_kwh": 285, "peak_factor": 1.35},
]

# Date range: 6 months (Jan 1 2026 – June 30 2026)
START_DATE = datetime(2026, 1, 1)
END_DATE = datetime(2026, 6, 30)

# Special periods (exam weeks get +15% energy)
EXAM_WEEKS = [
    (datetime(2026, 2, 16), datetime(2026, 2, 28)),  # Mid-semester exams
    (datetime(2026, 5, 1), datetime(2026, 5, 15)),   # End-semester exams
]

# Semester break (low activity, -40% energy)
SEMESTER_BREAKS = [
    (datetime(2026, 6, 1), datetime(2026, 6, 30)),   # Summer break start
]

# ============================================
# HOURLY ENERGY PROFILE GENERATORS
# ============================================

def get_hourly_profile(building_type: str, is_weekend: bool) -> np.ndarray:
    """
    Returns a 24-element array representing the hourly consumption 
    multiplier (0.0 - 1.0) for a given building type.
    """
    hours = np.arange(24)

    if building_type in ("academic", "lab", "library"):
        if is_weekend:
            # Low usage on weekends -- library has some, labs minimal
            profile = np.array([
                0.10, 0.08, 0.07, 0.07, 0.07, 0.08,  # 0-5: minimal
                0.12, 0.15, 0.20, 0.30, 0.35, 0.38,  # 6-11: some morning
                0.40, 0.38, 0.35, 0.30, 0.25, 0.20,  # 12-17: afternoon
                0.18, 0.15, 0.14, 0.13, 0.12, 0.11,  # 18-23: evening drop
            ])
        else:
            # Weekday: ramp up 6AM, peak 10AM-4PM, decline evening
            profile = np.array([
                0.12, 0.10, 0.09, 0.09, 0.09, 0.10,  # 0-5: overnight low
                0.20, 0.35, 0.55, 0.75, 0.90, 0.95,  # 6-11: morning ramp
                1.00, 0.98, 0.95, 0.90, 0.80, 0.60,  # 12-17: peak + decline
                0.40, 0.30, 0.25, 0.20, 0.16, 0.14,  # 18-23: evening
            ])

    elif building_type == "admin":
        if is_weekend:
            profile = np.full(24, 0.08)  # Almost nothing on weekends
            profile[8:12] = 0.15  # Maybe some security/maintenance
        else:
            profile = np.array([
                0.08, 0.07, 0.07, 0.07, 0.07, 0.08,
                0.15, 0.30, 0.60, 0.85, 0.95, 1.00,  # 9-11 peak office
                0.95, 0.90, 0.85, 0.80, 0.70, 0.40,  # afternoon
                0.20, 0.12, 0.10, 0.09, 0.08, 0.08,
            ])

    elif building_type == "hostel":
        if is_weekend:
            # Higher usage (students in rooms all day)
            profile = np.array([
                0.35, 0.30, 0.25, 0.20, 0.20, 0.20,  # 0-5: late night
                0.25, 0.35, 0.50, 0.55, 0.60, 0.65,  # 6-11: morning activities
                0.70, 0.65, 0.60, 0.55, 0.60, 0.70,  # 12-17: afternoon
                0.80, 0.90, 1.00, 0.95, 0.70, 0.50,  # 18-23: evening peak
            ])
        else:
            # Weekday: peaks morning (getting ready) and evening (back from class)
            profile = np.array([
                0.30, 0.25, 0.20, 0.18, 0.18, 0.20,  # 0-5: night
                0.50, 0.75, 0.60, 0.30, 0.20, 0.18,  # 6-11: morning rush
                0.20, 0.18, 0.15, 0.18, 0.25, 0.45,  # 12-17: most in class
                0.70, 0.85, 1.00, 0.95, 0.60, 0.40,  # 18-23: evening peak
            ])

    elif building_type == "amenity":
        if is_weekend:
            profile = np.array([
                0.05, 0.05, 0.05, 0.05, 0.05, 0.05,
                0.15, 0.30, 0.50, 0.70, 0.85, 0.95,  # Weekend morning rush
                1.00, 0.95, 0.85, 0.70, 0.55, 0.45,
                0.35, 0.25, 0.15, 0.10, 0.08, 0.06,
            ])
        else:
            profile = np.array([
                0.05, 0.05, 0.05, 0.05, 0.05, 0.08,
                0.20, 0.45, 0.65, 0.50, 0.40, 0.70,  # Breakfast + lunch prep
                1.00, 0.85, 0.50, 0.35, 0.55, 0.80,  # Lunch, tea, dinner
                0.90, 0.70, 0.40, 0.20, 0.10, 0.06,
            ])
    else:
        profile = np.full(24, 0.5)

    return profile


def get_seasonal_multiplier(date: datetime) -> float:
    """
    Summer months (April-June) increase energy due to AC load.
    Winter months have slightly lower consumption.
    """
    month = date.month
    if month in (4, 5, 6):
        return 1.20 + np.random.normal(0, 0.03)  # Summer: +20%
    elif month in (1, 2):
        return 0.90 + np.random.normal(0, 0.02)  # Winter: -10%
    elif month == 3:
        return 1.05 + np.random.normal(0, 0.02)  # Spring transition
    return 1.0


def is_exam_period(date: datetime) -> bool:
    for start, end in EXAM_WEEKS:
        if start <= date <= end:
            return True
    return False


def is_break_period(date: datetime) -> bool:
    for start, end in SEMESTER_BREAKS:
        if start <= date <= end:
            return True
    return False


# ============================================
# ENERGY DATA GENERATION
# ============================================

def generate_energy_data(buildings_with_ids: list[dict]) -> tuple[pd.DataFrame, list[dict]]:
    """
    Generate hourly energy readings for all buildings over 6 months.
    Returns (energy_dataframe, anomalies_list).
    """
    records = []
    anomalies = []

    total_days = (END_DATE - START_DATE).days + 1
    dates = [START_DATE + timedelta(days=d) for d in range(total_days)]

    for building in buildings_with_ids:
        btype = building["type"]
        base_kwh = building["base_kwh"]
        peak_factor = building["peak_factor"]
        bid = building["id"]
        has_ac = building["has_ac"]

        for date in dates:
            is_weekend = date.weekday() >= 5
            profile = get_hourly_profile(btype, is_weekend)

            # Apply seasonal multiplier
            seasonal = get_seasonal_multiplier(date)

            # AC buildings get bigger summer boost
            if has_ac and date.month in (4, 5, 6):
                seasonal *= 1.10

            # Exam period boost
            exam_boost = 1.15 if is_exam_period(date) else 1.0

            # Break period reduction
            break_reduction = 0.55 if is_break_period(date) else 1.0

            # Weekend reduction for non-hostels
            weekend_factor = 1.0
            if is_weekend and btype not in ("hostel",):
                weekend_factor = 0.45

            # Daily base with random variation
            daily_base = base_kwh * seasonal * exam_boost * break_reduction * weekend_factor
            daily_base *= (1.0 + np.random.normal(0, 0.05))  # ±5% daily noise

            # Random anomaly injection (~2% chance per building per day)
            inject_anomaly = np.random.random() < 0.02 and not is_break_period(date)
            anomaly_hour = np.random.randint(0, 24) if inject_anomaly else -1
            anomaly_type = np.random.choice(["overconsumption", "unusual_pattern", "equipment_fault", "after_hours"])

            for hour in range(24):
                kwh = (daily_base / 24.0) * profile[hour] * peak_factor

                # Add hourly noise
                kwh *= (1.0 + np.random.normal(0, 0.08))  # ±8% hourly noise
                kwh = max(kwh, 0.5)  # minimum reading

                # Inject anomaly spike
                is_anomaly = False
                if inject_anomaly and abs(hour - anomaly_hour) <= 1:
                    anomaly_multiplier = np.random.uniform(1.8, 3.0)
                    expected_kwh = kwh
                    kwh *= anomaly_multiplier
                    is_anomaly = True

                    if hour == anomaly_hour:
                        severity = "critical" if anomaly_multiplier > 2.5 else "high" if anomaly_multiplier > 2.0 else "medium"
                        descriptions = {
                            "overconsumption": f"Unusual spike detected: {kwh:.1f} kWh vs expected {expected_kwh:.1f} kWh",
                            "unusual_pattern": f"Consumption pattern deviates significantly from baseline for this hour",
                            "equipment_fault": f"Possible equipment malfunction: sudden {anomaly_multiplier:.1f}x increase in power draw",
                            "after_hours": f"High consumption detected during off-hours ({hour}:00) when building should be low-usage",
                        }
                        anomalies.append({
                            "building_id": bid,
                            "detected_at": (date + timedelta(hours=hour)).isoformat(),
                            "anomaly_type": anomaly_type,
                            "severity": severity,
                            "description": descriptions[anomaly_type],
                            "actual_kwh": round(kwh, 2),
                            "expected_kwh": round(expected_kwh, 2),
                            "is_resolved": np.random.random() < 0.6,  # 60% resolved historically
                        })

                # Determine if peak hour (10AM - 4PM weekday)
                is_peak = (10 <= hour <= 16) and not is_weekend

                # Electrical parameters
                voltage = round(np.random.normal(230, 5), 2)
                current = round(kwh * 1000 / (voltage * 1.732), 2) if voltage > 0 else 0
                pf = round(np.clip(np.random.normal(0.92, 0.03), 0.80, 0.99), 2)

                records.append({
                    "building_id": bid,
                    "timestamp": (date + timedelta(hours=hour)).isoformat(),
                    "consumption_kwh": round(kwh, 2),
                    "voltage": voltage,
                    "current_amp": current,
                    "power_factor": pf,
                    "is_peak_hour": is_peak,
                })

    df = pd.DataFrame(records)
    print(f"  Generated {len(df):,} energy readings, {len(anomalies)} anomalies")
    return df, anomalies


# ============================================
# WASTE DATA GENERATION
# ============================================

WASTE_PROFILES = {
    "academic": {"organic": 8, "recyclable": 12, "ewaste": 1.5, "general": 6},
    "lab": {"organic": 3, "recyclable": 8, "ewaste": 3.0, "general": 10},
    "library": {"organic": 4, "recyclable": 15, "ewaste": 0.5, "general": 5},
    "admin": {"organic": 5, "recyclable": 8, "ewaste": 0.8, "general": 4},
    "hostel": {"organic": 18, "recyclable": 10, "ewaste": 0.3, "general": 12},
    "amenity": {"organic": 25, "recyclable": 5, "ewaste": 0.1, "general": 8},
}


def generate_waste_data(buildings_with_ids: list[dict]) -> pd.DataFrame:
    """Generate daily waste records for all buildings."""
    records = []
    total_days = (END_DATE - START_DATE).days + 1
    dates = [START_DATE + timedelta(days=d) for d in range(total_days)]

    for building in buildings_with_ids:
        btype = building["type"]
        bid = building["id"]
        profile = WASTE_PROFILES.get(btype, WASTE_PROFILES["academic"])

        for date in dates:
            is_weekend = date.weekday() >= 5
            is_break = is_break_period(date)

            # Weekend: less waste for academic/admin, more for hostels
            weekend_factor = 1.0
            if is_weekend:
                weekend_factor = 1.2 if btype == "hostel" else 0.4

            # Break: much less waste
            break_factor = 0.3 if is_break else 1.0

            # Monthly variation
            month_factor = 1.0 + np.sin(date.month * np.pi / 6) * 0.15

            records.append({
                "building_id": bid,
                "date": date.strftime("%Y-%m-%d"),
                "organic_kg": round(max(0, profile["organic"] * weekend_factor * break_factor * month_factor * (1 + np.random.normal(0, 0.2))), 2),
                "recyclable_kg": round(max(0, profile["recyclable"] * weekend_factor * break_factor * month_factor * (1 + np.random.normal(0, 0.2))), 2),
                "ewaste_kg": round(max(0, profile["ewaste"] * break_factor * (1 + np.random.normal(0, 0.3))), 2),
                "general_kg": round(max(0, profile["general"] * weekend_factor * break_factor * month_factor * (1 + np.random.normal(0, 0.2))), 2),
            })

    df = pd.DataFrame(records)
    print(f"  Generated {len(df):,} waste records")
    return df


# ============================================
# CARBON FOOTPRINT AGGREGATION
# ============================================

CO2_PER_KWH = 0.82  # India grid average kg CO2 per kWh
TREE_CO2_PER_DAY = 0.06  # ~22 kg CO2/year / 365 days


def generate_carbon_data(energy_df: pd.DataFrame) -> pd.DataFrame:
    """Aggregate daily carbon footprint from energy data."""
    energy_df["date"] = pd.to_datetime(energy_df["timestamp"]).dt.date
    daily = energy_df.groupby("date")["consumption_kwh"].sum().reset_index()
    daily.columns = ["date", "total_energy_kwh"]
    daily["co2_kg"] = (daily["total_energy_kwh"] * CO2_PER_KWH).round(2)
    daily["trees_equivalent"] = (daily["co2_kg"] / TREE_CO2_PER_DAY).round(2)
    daily["date"] = daily["date"].astype(str)
    daily["total_energy_kwh"] = daily["total_energy_kwh"].round(2)

    print(f"  Generated {len(daily)} carbon footprint records")
    return daily


# ============================================
# RECOMMENDATIONS
# ============================================

def generate_recommendations(buildings_with_ids: list[dict]) -> list[dict]:
    """Create realistic pre-seeded optimization recommendations."""
    recommendations = []
    templates = [
        {
            "title": "Schedule HVAC shutdown at 6 PM in {name}",
            "description": "Analysis shows {name} HVAC system continues running 2-3 hours after closing time. Implementing an automated shutdown schedule at 6:00 PM could significantly reduce energy waste without impacting occupant comfort.",
            "category": "energy",
            "priority": "high",
            "savings": 12000, "kwh": 180, "co2": 147.6,
            "filter_ac": True,
        },
        {
            "title": "Install motion-sensor lighting in {name} corridors",
            "description": "Corridor lights in {name} remain on 24/7. Installing PIR motion sensors could reduce lighting energy by 40% during low-occupancy hours, particularly overnight and weekends.",
            "category": "energy",
            "priority": "medium",
            "savings": 5500, "kwh": 85, "co2": 69.7,
            "filter_ac": False,
        },
        {
            "title": "Implement waste segregation drive in {name}",
            "description": "{name} has a waste diversion rate below 35%. A targeted waste segregation awareness campaign and installing color-coded bins could improve recyclable recovery by 25%.",
            "category": "waste",
            "priority": "high",
            "savings": 3000, "kwh": 0, "co2": 45.0,
            "filter_ac": False,
        },
        {
            "title": "Upgrade to LED lighting in {name}",
            "description": "Approximately 60% of lighting fixtures in {name} use fluorescent tubes. Replacement with LED panels would reduce lighting energy consumption by 50% with improved lumen output.",
            "category": "energy",
            "priority": "medium",
            "savings": 8000, "kwh": 120, "co2": 98.4,
            "filter_ac": False,
        },
        {
            "title": "Optimize {name} server room cooling",
            "description": "The server room in {name} is over-cooled, maintaining 18°C when 24°C is sufficient per ASHRAE guidelines. Raising the setpoint would reduce cooling energy by 15%.",
            "category": "energy",
            "priority": "high",
            "savings": 15000, "kwh": 220, "co2": 180.4,
            "filter_ac": True,
            "filter_type": ["academic", "admin", "library"],
        },
        {
            "title": "Install solar panels on {name} rooftop",
            "description": "{name} has {area} sqft of unshaded rooftop space ideal for a 50kW solar installation. This could offset 30% of the building's daytime energy consumption.",
            "category": "carbon",
            "priority": "low",
            "savings": 25000, "kwh": 350, "co2": 287.0,
            "filter_ac": False,
        },
        {
            "title": "Composting program for {name}",
            "description": "{name} generates significant organic waste daily. Setting up an on-site composting unit would divert organic waste from landfills and produce usable compost for campus gardens.",
            "category": "waste",
            "priority": "medium",
            "savings": 2000, "kwh": 0, "co2": 30.0,
            "filter_ac": False,
            "filter_type": ["hostel", "amenity"],
        },
        {
            "title": "Reduce standby power in {name} labs",
            "description": "Lab equipment in {name} draws significant standby power overnight. Installing smart power strips with scheduled shutoffs could reduce phantom load by 60%.",
            "category": "energy",
            "priority": "high",
            "savings": 7000, "kwh": 100, "co2": 82.0,
            "filter_ac": False,
            "filter_type": ["academic", "lab"],
        },
    ]

    statuses = ["pending", "pending", "pending", "implemented", "dismissed"]

    for building in buildings_with_ids:
        for template in templates:
            # Filter by AC requirement
            if template.get("filter_ac") and not building["has_ac"]:
                continue
            # Filter by building type
            if "filter_type" in template and building["type"] not in template["filter_type"]:
                continue

            # Add some randomness to savings
            variance = np.random.uniform(0.8, 1.2)
            recommendations.append({
                "building_id": building["id"],
                "title": template["title"].format(name=building["name"]),
                "description": template["description"].format(name=building["name"], area=building.get("area_sqft", 10000)),
                "category": template["category"],
                "priority": template["priority"],
                "estimated_savings_monthly": round(template["savings"] * variance, 2),
                "estimated_kwh_saved": round(template["kwh"] * variance, 2),
                "co2_reduction_kg": round(template["co2"] * variance, 2),
                "status": np.random.choice(statuses),
            })

    print(f"  Generated {len(recommendations)} recommendations")
    return recommendations


# ============================================
# MAIN: GENERATE ALL DATA AND SAVE TO CSV
# ============================================

def main():
    """Generate all synthetic data and save to CSV files."""
    output_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(output_dir, exist_ok=True)

    print("=" * 60)
    print("EcoCampus AI - Synthetic Data Generator")
    print("=" * 60)
    print(f"Date range: {START_DATE.date()} to {END_DATE.date()}")
    print(f"Buildings: {len(BUILDINGS)}")
    print()

    # Step 1: Save buildings (IDs will be assigned by Supabase)
    # For now, use code as temporary ID for linking
    print("[1/5] Preparing buildings...")
    buildings_df = pd.DataFrame([{
        "name": b["name"],
        "code": b["code"],
        "type": b["type"],
        "area_sqft": b["area_sqft"],
        "floors": b["floors"],
        "has_ac": b["has_ac"],
    } for b in BUILDINGS])
    buildings_df.to_csv(os.path.join(output_dir, "buildings.csv"), index=False)
    print(f"  Saved {len(buildings_df)} buildings")

    # For generation, use code as placeholder ID (will be replaced during seeding)
    buildings_with_ids = [{**b, "id": b["code"]} for b in BUILDINGS]

    # Step 2: Generate energy data
    print("\n[2/5] Generating energy readings (this may take a moment)...")
    energy_df, anomalies = generate_energy_data(buildings_with_ids)
    energy_df.to_csv(os.path.join(output_dir, "energy_readings.csv"), index=False)

    # Step 3: Generate waste data
    print("\n[3/5] Generating waste records...")
    waste_df = generate_waste_data(buildings_with_ids)
    waste_df.to_csv(os.path.join(output_dir, "waste_records.csv"), index=False)

    # Step 4: Generate carbon footprint
    print("\n[4/5] Calculating carbon footprint...")
    carbon_df = generate_carbon_data(energy_df)
    carbon_df.to_csv(os.path.join(output_dir, "carbon_footprint.csv"), index=False)

    # Step 5: Generate recommendations and anomalies
    print("\n[5/5] Generating recommendations & anomalies...")
    recs = generate_recommendations(buildings_with_ids)

    # Save anomalies and recommendations
    pd.DataFrame(anomalies).to_csv(os.path.join(output_dir, "anomalies.csv"), index=False)
    pd.DataFrame(recs).to_csv(os.path.join(output_dir, "recommendations.csv"), index=False)

    # Summary
    print("\n" + "=" * 60)
    print("GENERATION COMPLETE")
    print("=" * 60)
    print(f"  Energy readings: {len(energy_df):,}")
    print(f"  Waste records:   {len(waste_df):,}")
    print(f"  Carbon records:  {len(carbon_df):,}")
    print(f"  Anomalies:       {len(anomalies):,}")
    print(f"  Recommendations: {len(recs):,}")
    print(f"\n  Output: {os.path.abspath(output_dir)}")


if __name__ == "__main__":
    main()
