"""
EcoCampus AI - Carbon Footprint Calculator
============================================
Utility functions for carbon footprint calculations and equivalences.
"""

# India grid emission factor (kg CO2 per kWh)
# Source: CEA CO2 Baseline Database V18 (2023)
GRID_EMISSION_FACTOR = 0.727  # CEA v20.0 FY2023-24 India grid (updated Dec 2024)

# Equivalence constants
TREE_CO2_YEAR_KG = 22.0          # kg CO2 absorbed by one tree per year
CAR_CO2_PER_KM = 0.12            # kg CO2 per km driven (average car)
HOME_KWH_PER_DAY = 30.0          # avg Indian home daily consumption
PHONE_CHARGE_KWH = 0.008         # kWh per phone charge
FLIGHT_CO2_PER_KM = 0.255        # kg CO2 per passenger-km (domestic)


def kwh_to_co2(kwh: float) -> float:
    """Convert kWh to kg CO2."""
    return round(kwh * GRID_EMISSION_FACTOR, 2)


def co2_equivalences(co2_kg: float) -> dict:
    """Convert CO2 kg to relatable equivalences."""
    return {
        "co2_kg": round(co2_kg, 2),
        "trees_planted_equivalent": round(co2_kg / TREE_CO2_YEAR_KG, 1),
        "car_km_avoided": round(co2_kg / CAR_CO2_PER_KM, 0),
        "homes_powered_days": round(co2_kg / (HOME_KWH_PER_DAY * GRID_EMISSION_FACTOR), 1),
        "phone_charges": int(co2_kg / (PHONE_CHARGE_KWH * GRID_EMISSION_FACTOR)),
        "flight_km_equivalent": round(co2_kg / FLIGHT_CO2_PER_KM, 0),
    }


def calculate_sustainability_score(
    energy_efficiency_ratio: float,  # building kWh/sqft vs campus avg (lower = better)
    waste_diversion_rate: float,     # 0-1 (higher = better)
    anomaly_rate: float,             # % of anomalous readings (lower = better)
    recommendation_adoption: float,  # % of recommendations implemented (higher = better)
) -> dict:
    """
    Calculate a composite sustainability score (0-100).
    
    Components:
        - Energy Efficiency: 35 points
        - Waste Diversion: 25 points
        - Operational Excellence (low anomalies): 20 points
        - Proactive Improvement (recommendation adoption): 20 points
    """
    # Energy efficiency score (35 pts) — ratio < 0.8 = excellent, > 1.5 = poor
    if energy_efficiency_ratio <= 0.8:
        energy_score = 35
    elif energy_efficiency_ratio >= 1.5:
        energy_score = 5
    else:
        energy_score = 35 - (energy_efficiency_ratio - 0.8) * (30 / 0.7)

    # Waste diversion score (25 pts) — 60%+ = excellent
    waste_score = min(25, waste_diversion_rate * 25 / 0.6)

    # Operational excellence score (20 pts) — <2% anomalies = excellent
    if anomaly_rate <= 2:
        ops_score = 20
    elif anomaly_rate >= 10:
        ops_score = 5
    else:
        ops_score = 20 - (anomaly_rate - 2) * (15 / 8)

    # Recommendation adoption score (20 pts)
    adopt_score = recommendation_adoption * 20

    total = round(max(0, min(100, energy_score + waste_score + ops_score + adopt_score)))

    return {
        "total_score": total,
        "grade": "A+" if total >= 90 else "A" if total >= 80 else "B" if total >= 70 else "C" if total >= 60 else "D" if total >= 50 else "F",
        "breakdown": {
            "energy_efficiency": round(energy_score, 1),
            "waste_diversion": round(waste_score, 1),
            "operational_excellence": round(ops_score, 1),
            "improvement_adoption": round(adopt_score, 1),
        },
    }
