from flask import Blueprint, request, jsonify
import pandas as pd
import os
import random

statistics_bp = Blueprint("statistics_bp", __name__)

# Dataset path 
DATA_PATH = os.path.join("dataset", "indore_crime.csv")
df = pd.read_csv(DATA_PATH)

# Parse timestamps safely
df["timestamp"] = pd.to_datetime(df["timestamp"], dayfirst=True, errors="coerce")
df = df.dropna(subset=["timestamp"])
df["Year"] = df["timestamp"].dt.year
df["Month"] = df["timestamp"].dt.strftime("%B")

# Crime columns & mapping (for display)
crime_columns = [c for c in df.columns if c.startswith("act")]
crime_mapping = {
    "act13": "Obscenity Cases",
    "act279": "Traffic Violations",
    "act302": "Murder",
    "act323": "Assault / Hurt",
    "act363": "Kidnapping",
    "act379": "Theft / Robbery",
}

MONTH_ORDER = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
]


def generate_demo_data():
    data = []
    for year in range(2020, 2026):
        for month in MONTH_ORDER:
            entry = {"Year": year, "Month": month}
            for act in crime_columns:
                base = {
                    "act13": random.randint(10, 60),
                    "act279": random.randint(80, 200),
                    "act302": random.randint(0, 10),
                    "act323": random.randint(200, 500),
                    "act363": random.randint(10, 40),
                    "act379": random.randint(50, 150),
                }[act]
                
                if month in ["May", "June", "July"]:
                    base += random.randint(20, 50)
                entry[act] = base
            data.append(entry)
    return pd.DataFrame(data)


demo_df = generate_demo_data()

@statistics_bp.route("/crime_stats", methods=["POST"])
def crime_stats():
    try:
        data = request.get_json()
        year_filter = int(data.get("year", "0")) if data.get("year") and data.get("year") != "All" else None
        month_filter = data.get("month", "All")
        crime_filter = data.get("crime_type", "All")

        filtered = demo_df.copy()

        if year_filter:
            filtered = filtered[filtered["Year"] == year_filter]
        if month_filter != "All":
            filtered = filtered[filtered["Month"].str.lower() == month_filter.lower()]

        # Compute totals
        filtered["Total_Crimes"] = filtered[crime_columns].sum(axis=1)

        yearly_trend = filtered.groupby("Year")["Total_Crimes"].sum().to_dict()
        month_counts = filtered.groupby("Month")["Total_Crimes"].sum()
        monthly_trend = {m: int(month_counts.get(m, 0)) for m in MONTH_ORDER}

        if crime_filter != "All" and crime_filter in crime_columns:
            type_distribution = {crime_mapping[crime_filter]: int(filtered[crime_filter].sum())}
        else:
            type_distribution = {crime_mapping[c]: int(filtered[c].sum()) for c in crime_columns}

        return jsonify({
            "yearly_trend": yearly_trend,
            "monthly_trend": monthly_trend,
            "crime_type_distribution": type_distribution
        })

    except Exception as e:
        print("❌ Error in /crime_stats:", e)
        return jsonify({"error": str(e)}), 500
