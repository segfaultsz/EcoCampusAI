"""
EcoCampus AI - Recommendation Engine
=======================================
Generates optimization recommendations using rule-based analysis
enhanced with statistical patterns from energy and waste data.
"""

import numpy as np
import pandas as pd
from datetime import datetime


class RecommendationEngine:
    """Generates actionable sustainability recommendations."""

    # Carbon constants
    CO2_PER_KWH = 0.82       # India grid average
    COST_PER_KWH = 8.50      # ₹ per kWh (commercial rate)
    TREE_CO2_YEAR = 22.0     # kg CO2 absorbed per tree per year
    CAR_CO2_PER_KM = 0.12    # kg CO2 per km driven

    def analyze_building(self, building: dict, energy_data: pd.DataFrame,
                          waste_data: pd.DataFrame = None,
                          campus_avg_kwh_per_sqft: float = None) -> list[dict]:
        """
        Analyze a building's data and generate recommendations.
        
        Args:
            building: Building metadata (name, type, area_sqft, has_ac, etc.)
            energy_data: Energy readings for this building
            waste_data: Waste records for this building (optional)
            campus_avg_kwh_per_sqft: Campus-wide average for comparison
        
        Returns:
            List of recommendation dicts
        """
        recommendations = []

        # Prepare energy data
        df = energy_data.copy()
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df["hour"] = df["timestamp"].dt.hour
        df["day_of_week"] = df["timestamp"].dt.dayofweek
        df["is_weekend"] = df["day_of_week"] >= 5
        df["date"] = df["timestamp"].dt.date

        # Run all analysis rules
        recommendations.extend(self._check_after_hours(building, df))
        recommendations.extend(self._check_weekend_usage(building, df))
        recommendations.extend(self._check_peak_optimization(building, df))
        recommendations.extend(self._check_efficiency(building, df, campus_avg_kwh_per_sqft))

        if building.get("has_ac"):
            recommendations.extend(self._check_hvac(building, df))

        if waste_data is not None and len(waste_data) > 0:
            recommendations.extend(self._check_waste(building, waste_data))

        return recommendations

    def _check_after_hours(self, building: dict, df: pd.DataFrame) -> list[dict]:
        """Check for excessive after-hours energy consumption."""
        recs = []
        btype = building.get("type", "")
        name = building["name"]

        # Define "after hours" based on building type
        if btype in ("academic", "admin", "lab"):
            after_hours = df[(df["hour"] >= 20) | (df["hour"] <= 5)]
            peak_hours = df[(df["hour"] >= 9) & (df["hour"] <= 17)]
        elif btype == "library":
            after_hours = df[(df["hour"] >= 22) | (df["hour"] <= 6)]
            peak_hours = df[(df["hour"] >= 8) & (df["hour"] <= 21)]
        else:
            return recs  # Hostels/amenities have different patterns

        if len(peak_hours) == 0 or len(after_hours) == 0:
            return recs

        after_avg = after_hours["consumption_kwh"].mean()
        peak_avg = peak_hours["consumption_kwh"].mean()
        ratio = after_avg / peak_avg if peak_avg > 0 else 0

        if ratio > 0.30:
            # Significant after-hours usage
            potential_save_kwh = (after_avg - peak_avg * 0.15) * len(after_hours["date"].unique()) * 10  # hours
            potential_save_cost = potential_save_kwh * self.COST_PER_KWH
            co2 = potential_save_kwh * self.CO2_PER_KWH

            recs.append({
                "title": f"Reduce after-hours energy usage in {name}",
                "description": (
                    f"After-hours consumption in {name} averages {after_avg:.1f} kWh/hr, "
                    f"which is {ratio*100:.0f}% of peak-hour levels. This indicates equipment "
                    f"(HVAC, lights, computers) running unnecessarily. Implementing automated "
                    f"shutdown schedules and occupancy sensors could reduce this significantly."
                ),
                "category": "energy",
                "priority": "high" if ratio > 0.45 else "medium",
                "estimated_savings_monthly": round(potential_save_cost / 6, 2),  # 6 months of data
                "estimated_kwh_saved": round(potential_save_kwh / 6, 2),
                "co2_reduction_kg": round(co2 / 6, 2),
            })

        return recs

    def _check_weekend_usage(self, building: dict, df: pd.DataFrame) -> list[dict]:
        """Check if weekend usage is disproportionately high."""
        recs = []
        name = building["name"]
        btype = building.get("type", "")

        if btype in ("hostel", "amenity"):
            return recs  # Expected to have weekend usage

        weekday = df[~df["is_weekend"]].groupby("date")["consumption_kwh"].sum()
        weekend = df[df["is_weekend"]].groupby("date")["consumption_kwh"].sum()

        if len(weekday) == 0 or len(weekend) == 0:
            return recs

        ratio = weekend.mean() / weekday.mean()

        if ratio > 0.55:
            excess_kwh = (weekend.mean() - weekday.mean() * 0.35) * len(weekend)
            savings = excess_kwh * self.COST_PER_KWH

            recs.append({
                "title": f"Optimize weekend operations in {name}",
                "description": (
                    f"Weekend energy consumption in {name} is {ratio*100:.0f}% of weekday levels. "
                    f"For a {btype} building, this should ideally be below 40%. Review weekend "
                    f"HVAC schedules, lighting, and equipment standby power."
                ),
                "category": "energy",
                "priority": "medium",
                "estimated_savings_monthly": round(savings / 6, 2),
                "estimated_kwh_saved": round(excess_kwh / 6, 2),
                "co2_reduction_kg": round(excess_kwh * self.CO2_PER_KWH / 6, 2),
            })

        return recs

    def _check_peak_optimization(self, building: dict, df: pd.DataFrame) -> list[dict]:
        """Check if peak shaving could help."""
        recs = []
        name = building["name"]

        daily_totals = df.groupby("date")["consumption_kwh"].sum()
        daily_peaks = df.groupby("date")["consumption_kwh"].max()

        if len(daily_totals) == 0:
            return recs

        # Peak to average ratio
        avg_daily = daily_totals.mean()
        avg_peak = daily_peaks.mean()
        peak_ratio = avg_peak / (avg_daily / 24) if avg_daily > 0 else 0

        if peak_ratio > 3.5:
            # High peak-to-average ratio — load shifting could help
            potential_kwh = avg_daily * 0.08 * len(daily_totals)  # 8% reduction via load shifting
            savings = potential_kwh * self.COST_PER_KWH

            recs.append({
                "title": f"Implement peak load shifting in {name}",
                "description": (
                    f"Peak consumption in {name} is {peak_ratio:.1f}x the average hourly rate. "
                    f"Shifting non-critical loads (water heaters, EV charging, battery storage) "
                    f"to off-peak hours could reduce demand charges and flatten the load profile."
                ),
                "category": "energy",
                "priority": "high" if peak_ratio > 4.5 else "medium",
                "estimated_savings_monthly": round(savings / 6, 2),
                "estimated_kwh_saved": round(potential_kwh / 6, 2),
                "co2_reduction_kg": round(potential_kwh * self.CO2_PER_KWH / 6, 2),
            })

        return recs

    def _check_efficiency(self, building: dict, df: pd.DataFrame,
                           campus_avg: float = None) -> list[dict]:
        """Check energy efficiency per sqft against campus average."""
        recs = []
        name = building["name"]
        area = building.get("area_sqft", 0)

        if area <= 0:
            return recs

        total_kwh = df.groupby("date")["consumption_kwh"].sum().mean()
        kwh_per_sqft = total_kwh / area

        if campus_avg and kwh_per_sqft > campus_avg * 1.4:
            excess_pct = ((kwh_per_sqft / campus_avg) - 1) * 100
            excess_kwh = (kwh_per_sqft - campus_avg) * area * 30  # monthly

            recs.append({
                "title": f"Energy audit recommended for {name}",
                "description": (
                    f"{name} consumes {kwh_per_sqft:.3f} kWh/sqft/day, which is "
                    f"{excess_pct:.0f}% above the campus average of {campus_avg:.3f} kWh/sqft/day. "
                    f"A detailed energy audit could identify specific inefficiencies in HVAC, "
                    f"lighting, or equipment."
                ),
                "category": "energy",
                "priority": "high" if excess_pct > 60 else "medium",
                "estimated_savings_monthly": round(excess_kwh * self.COST_PER_KWH, 2),
                "estimated_kwh_saved": round(excess_kwh, 2),
                "co2_reduction_kg": round(excess_kwh * self.CO2_PER_KWH, 2),
            })

        return recs

    def _check_hvac(self, building: dict, df: pd.DataFrame) -> list[dict]:
        """HVAC-specific optimization checks."""
        recs = []
        name = building["name"]

        # Check summer vs winter consumption ratio
        df_monthly = df.copy()
        df_monthly["month"] = df_monthly["timestamp"].dt.month
        monthly_avg = df_monthly.groupby("month")["consumption_kwh"].mean()

        summer = monthly_avg.get(5, monthly_avg.get(4, 0))  # May or April
        winter = monthly_avg.get(1, monthly_avg.get(2, 0))  # Jan or Feb

        if winter > 0 and summer / winter > 1.4:
            hvac_kwh = (summer - winter) * 24 * 30  # hourly excess * hours/day * days/month
            savings = hvac_kwh * self.COST_PER_KWH * 0.15  # 15% HVAC optimization

            recs.append({
                "title": f"Optimize HVAC setpoints in {name}",
                "description": (
                    f"Summer consumption in {name} is {(summer/winter)*100:.0f}% of winter levels, "
                    f"indicating heavy HVAC cooling load. Raising the setpoint by 2°C (from typical "
                    f"22°C to 24°C) can reduce cooling energy by 10-15% without significant "
                    f"comfort impact (per ASHRAE 55 guidelines)."
                ),
                "category": "energy",
                "priority": "medium",
                "estimated_savings_monthly": round(savings, 2),
                "estimated_kwh_saved": round(hvac_kwh * 0.15, 2),
                "co2_reduction_kg": round(hvac_kwh * 0.15 * self.CO2_PER_KWH, 2),
            })

        return recs

    def _check_waste(self, building: dict, waste_df: pd.DataFrame) -> list[dict]:
        """Waste-related recommendations."""
        recs = []
        name = building["name"]
        wdf = waste_df.copy()

        total_waste = (wdf["organic_kg"] + wdf["recyclable_kg"] + wdf["ewaste_kg"] + wdf["general_kg"]).sum()
        recyclable_total = wdf["recyclable_kg"].sum()
        organic_total = wdf["organic_kg"].sum()
        diversion_rate = (recyclable_total + organic_total) / total_waste if total_waste > 0 else 0

        if diversion_rate < 0.45:
            recs.append({
                "title": f"Improve waste diversion in {name}",
                "description": (
                    f"{name} has a waste diversion rate of {diversion_rate*100:.0f}%, well below "
                    f"the 60% target. {organic_total:.0f} kg of organic waste and {recyclable_total:.0f} kg "
                    f"of recyclable waste were generated. Implementing better segregation at source "
                    f"and awareness campaigns could improve this by 15-20%."
                ),
                "category": "waste",
                "priority": "high" if diversion_rate < 0.3 else "medium",
                "estimated_savings_monthly": round(total_waste * 0.15 * 2.5, 2),  # ₹2.5/kg waste processing
                "estimated_kwh_saved": 0,
                "co2_reduction_kg": round(total_waste * 0.15 * 0.5, 2),  # 0.5 kg CO2 per kg landfill
            })

        # E-waste check
        ewaste_total = wdf["ewaste_kg"].sum()
        if ewaste_total > 20:
            recs.append({
                "title": f"E-waste recycling program for {name}",
                "description": (
                    f"{name} has generated {ewaste_total:.1f} kg of e-waste. Setting up a "
                    f"dedicated e-waste collection and certified recycling partnership can ensure "
                    f"proper disposal and potential material recovery value."
                ),
                "category": "waste",
                "priority": "medium",
                "estimated_savings_monthly": round(ewaste_total * 15, 2),  # ₹15/kg material recovery
                "estimated_kwh_saved": 0,
                "co2_reduction_kg": round(ewaste_total * 2.0, 2),
            })

        return recs

    def calculate_carbon_equivalence(self, co2_kg: float) -> dict:
        """Convert CO2 savings to relatable equivalences."""
        return {
            "co2_kg": round(co2_kg, 2),
            "trees_equivalent": round(co2_kg / self.TREE_CO2_YEAR, 1),
            "car_km_equivalent": round(co2_kg / self.CAR_CO2_PER_KM, 0),
            "homes_powered_days": round(co2_kg / (30 * self.CO2_PER_KWH), 1),
            "phones_charged": round(co2_kg / (0.008 * self.CO2_PER_KWH), 0),  # ~8Wh per charge
        }

    def simulate_what_if(self, energy_data: pd.DataFrame, scenario: dict) -> dict:
        """
        Run a what-if simulation.
        
        Scenarios:
            - ac_shutdown_hour: int (hour to shut AC, e.g., 18)
            - lighting_reduction_pct: float (0-100)
            - weekend_shutdown: bool
            - setpoint_increase_c: float (degrees to increase AC setpoint)
        """
        df = energy_data.copy()
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df["hour"] = df["timestamp"].dt.hour
        df["is_weekend"] = df["timestamp"].dt.dayofweek >= 5

        total_original = df["consumption_kwh"].sum()
        total_simulated = total_original

        impacts = []

        # AC shutdown scenario
        if "ac_shutdown_hour" in scenario:
            shutdown = scenario["ac_shutdown_hour"]
            after_shutdown = df[df["hour"] >= shutdown]["consumption_kwh"].sum()
            # Estimate AC as 40% of after-hours consumption
            ac_savings = after_shutdown * 0.40
            total_simulated -= ac_savings
            impacts.append({
                "scenario": f"Shut AC at {shutdown}:00",
                "kwh_saved": round(ac_savings, 2),
                "cost_saved": round(ac_savings * self.COST_PER_KWH, 2),
            })

        # Lighting reduction
        if "lighting_reduction_pct" in scenario:
            pct = scenario["lighting_reduction_pct"] / 100
            # Lighting typically 25% of building consumption
            lighting_savings = total_original * 0.25 * pct
            total_simulated -= lighting_savings
            impacts.append({
                "scenario": f"Reduce lighting by {scenario['lighting_reduction_pct']}%",
                "kwh_saved": round(lighting_savings, 2),
                "cost_saved": round(lighting_savings * self.COST_PER_KWH, 2),
            })

        # Weekend shutdown
        if scenario.get("weekend_shutdown"):
            weekend_usage = df[df["is_weekend"]]["consumption_kwh"].sum()
            # Keep 20% for essentials
            weekend_savings = weekend_usage * 0.80
            total_simulated -= weekend_savings
            impacts.append({
                "scenario": "Complete weekend shutdown (keep 20% essentials)",
                "kwh_saved": round(weekend_savings, 2),
                "cost_saved": round(weekend_savings * self.COST_PER_KWH, 2),
            })

        # Setpoint increase
        if "setpoint_increase_c" in scenario:
            increase = scenario["setpoint_increase_c"]
            # Each 1°C increase saves ~3-5% on cooling
            cooling_pct = 0.04 * increase  # 4% per degree
            cooling_savings = total_original * 0.35 * cooling_pct  # 35% is cooling load
            total_simulated -= cooling_savings
            impacts.append({
                "scenario": f"Increase AC setpoint by {increase}°C",
                "kwh_saved": round(cooling_savings, 2),
                "cost_saved": round(cooling_savings * self.COST_PER_KWH, 2),
            })

        total_savings_kwh = total_original - total_simulated
        total_savings_cost = total_savings_kwh * self.COST_PER_KWH
        total_co2 = total_savings_kwh * self.CO2_PER_KWH

        return {
            "original_kwh": round(total_original, 2),
            "simulated_kwh": round(total_simulated, 2),
            "total_savings_kwh": round(total_savings_kwh, 2),
            "total_savings_cost": round(total_savings_cost, 2),
            "savings_percentage": round((total_savings_kwh / total_original) * 100, 1) if total_original > 0 else 0,
            "co2_reduction_kg": round(total_co2, 2),
            "carbon_equivalence": self.calculate_carbon_equivalence(total_co2),
            "impacts": impacts,
        }
