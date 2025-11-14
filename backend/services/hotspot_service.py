import os
import pandas as pd
import folium
from folium.plugins import HeatMap
from io import BytesIO
import base64
import matplotlib
matplotlib.use('Agg')  
import matplotlib.pyplot as plt
import math

# Ensure templates folder exists (for saving map.html)
templates_dir = os.path.join(os.path.dirname(__file__), "..", "templates")
os.makedirs(templates_dir, exist_ok=True)

DATA_PATH = "dataset/indore_crime.csv"
df = pd.read_csv(DATA_PATH)

# Debug: Print dataset info
print(f"Dataset loaded: {len(df)} rows, columns: {list(df.columns)[:10]}...")
if 'area' in df.columns or 'Area' in df.columns:
    area_col = 'area' if 'area' in df.columns else 'Area'
    print(f"Dataset has area column '{area_col}'. Unique areas: {df[area_col].nunique()}")

# Crime Mapping Dictionary
crime_mapping = {
    "act302": "Murder",
    "act307": "Attempt to Murder",
    "act376": "Rape",
    "act379": "Theft",
    "act380": "House Theft",
    "act392": "Robbery",
    "act394": "Attempted Robbery",
    "act397": "Armed Robbery",
    "act420": "Cheating/Fraud",
    "act323": "Voluntarily causing hurt",
    "act324": "Causing hurt by dangerous weapon",
    "act325": "Grievous Hurt",
    "act363": "Kidnapping",
    "act366": "Kidnapping (Women)",
    "act279": "Rash Driving",
    "act13": "Arms Act Violation",
    "act354": "Outraging Modesty of Women",
}

area_coords = {
    "Rajwada": (22.7170, 75.8577),
    "Vijay Nagar": (22.7500, 75.8900),
    "Palasia": (22.7245, 75.8779),
    "MR10": (22.7615, 75.9032),
    "Bhawarkuan": (22.6763, 75.8704),
    "Sudama Nagar": (22.6810, 75.8478),
    "LIG": (22.7406, 75.8925),
    "Geeta Bhawan": (22.7272, 75.8721),
    "Khajrana": (22.7451, 75.9164),
    "Musakhedi": (22.7538, 75.8791),
    "Mhow Naka": (22.6683, 75.8550),
    "Indrapuri": (22.7022, 75.8673),
    "Navlakha": (22.7075, 75.8743),
    "Airport Road": (22.7305, 75.8019),
    "Tilak Nagar": (22.7258, 75.9045),
    "Annapurna": (22.6959, 75.8572),
    "Sapna Sangeeta": (22.7283, 75.8688),
    "Rau": (22.6371, 75.8273),
    "Kanadia Road": (22.7362, 75.9484),
    "Nipania": (22.7698, 75.9156),
    "Bengali Square": (22.7318, 75.9222),
    "Manik Bagh": (22.6950, 75.8667),
    "Chhavni": (22.7019, 75.8427),
    "Saket": (22.7329, 75.8992),
    "Patnipura": (22.7229, 75.8766),
    "Malwa Mill": (22.7133, 75.8618),
    "Rajendra Nagar": (22.6691, 75.8559),
    "Snehlataganj": (22.7253, 75.8660),
    "Bicholi Mardana": (22.7136, 75.9302),
    "Silicon City": (22.6809, 75.8369),
    "Vishnupuri": (22.7005, 75.8602),
    "Jail Road": (22.7137, 75.8550),
    "Yeshwant Club": (22.7175, 75.8710),
    "White Church": (22.7259, 75.8772),
    "Khatiwala Tank": (22.7110, 75.8618),
    "Pipliyahana": (22.7142, 75.9180),
    "Scheme 78": (22.7572, 75.8929),
    "Scheme 54": (22.7499, 75.8955),
    "Scheme 94": (22.7655, 75.9050),
    "Scheme 140": (22.7734, 75.9111),
    "Scheme 71": (22.7385, 75.8781),
    "Scheme 74": (22.7432, 75.8881),
    "Scheme 103": (22.7671, 75.9067),
    "Scheme 134": (22.7755, 75.9102),
    "Scheme 114": (22.7714, 75.9070),
    "Pardesipura": (22.7345, 75.8678),
    "Kalani Nagar": (22.7199, 75.8202),
    "Kesar Bagh": (22.7025, 75.8324),
    "Sukhliya": (22.7633, 75.8921),
    "Bengali Colony": (22.7322, 75.9162),
    "Scheme 136": (22.7737, 75.9137),
    "Bicholi Hapsi": (22.7177, 75.9351)
}

# Utility: Get nearest area coordinate
def get_nearest_area(area_name):
    # Normalize area name: strip whitespace and handle case-insensitive matching
    area_name = area_name.strip() if area_name else ""
    
    # Try exact match first
    if area_name in area_coords:
        return area_coords[area_name], True
    
    # Try case-insensitive match
    area_name_lower = area_name.lower()
    for key, coords in area_coords.items():
        if key.lower() == area_name_lower:
            return coords, True
    
    # If no match found, return default (Indore center) and indicate it wasn't found
    print(f"Warning: Area '{area_name}' not found in area_coords. Using default coordinates.")
    return (22.72, 75.87), False

# Calculate Safety Score
def get_safety_score(sub_df):
    if len(sub_df) == 0:
        return None
    total_crimes = sub_df['crime_count'].sum() if 'crime_count' in sub_df.columns else len(sub_df)
    max_crimes = df['crime_count'].max() if 'crime_count' in df.columns else 200
    return max(0, 100 - int((total_crimes / max_crimes) * 100))

# Chart Generators
def generate_pie_chart(sub_df):
    # Find crime columns dynamically (columns starting with 'act')
    crime_cols = [col for col in sub_df.columns if col.startswith('act')]
    if not crime_cols:
        # Fallback: try to use columns 1-7 if act columns not found
        crime_cols = sub_df.columns[1:7].tolist() if len(sub_df.columns) > 7 else sub_df.columns[1:].tolist()
    
    counts = sub_df[crime_cols].sum()
    counts = counts[counts > 0]  # Only show crimes with counts > 0
    counts.index = [crime_mapping.get(c, c) for c in counts.index]
    
    if len(counts) == 0:
        return None
    
    plt.figure(figsize=(3.3, 3.3))
    plt.pie(counts, labels=counts.index, autopct="%1.1f%%")
    buf = BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight")
    plt.close()
    return base64.b64encode(buf.getvalue()).decode("utf-8")

def generate_bar_chart(sub_df):
    # Find crime columns dynamically (columns starting with 'act')
    crime_cols = [col for col in sub_df.columns if col.startswith('act')]
    if not crime_cols:
        # Fallback: try to use columns 1-7 if act columns not found
        crime_cols = sub_df.columns[1:7].tolist() if len(sub_df.columns) > 7 else sub_df.columns[1:].tolist()
    
    counts = sub_df[crime_cols].sum()
    counts = counts[counts > 0]  # Only show crimes with counts > 0
    counts.index = [crime_mapping.get(c, c) for c in counts.index]
    
    if len(counts) == 0:
        return None
    
    plt.figure(figsize=(4.2, 3.2))
    counts.plot(kind="bar")
    plt.ylabel("Crime Count")
    plt.xticks(rotation=45, ha='right')
    buf = BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight")
    plt.close()
    return base64.b64encode(buf.getvalue()).decode("utf-8")

# Main Function (Single Area Only)
def get_area_analysis(area1):
    (lat1, lon1), area_found = get_nearest_area(area1)
    
    # First, try to filter by area name if the dataset has an area column
    # This is more precise than coordinate-based filtering
    area_col = None
    if 'area' in df.columns:
        area_col = 'area'
    elif 'Area' in df.columns:
        area_col = 'Area'
    
    sub_df1 = None
    if area_col:
        # Try exact match first
        area_filter = df[df[area_col].str.strip().str.lower() == area1.strip().lower()]
        if len(area_filter) > 0:
            sub_df1 = area_filter.copy()
            print(f"Area: '{area1}' - Filtered by area column '{area_col}': {len(sub_df1)} rows")
    
    # If area column filtering didn't work or doesn't exist, use coordinate-based filtering
    if sub_df1 is None or len(sub_df1) == 0:
        # Use a balanced radius (0.007 degrees ≈ 770m) to get enough data while avoiding overlaps
        # This ensures each area gets its own distinct data but with sufficient crime records
        radius = 0.007
        
        # Filter data by coordinates with a circular distance check
        def calculate_distance(lat, lon, center_lat, center_lon):
            """Calculate approximate distance in degrees"""
            return math.sqrt((lat - center_lat)**2 + (lon - center_lon)**2)
        
        # Filter using a tighter bounding box first for performance, then refine with distance
        sub_df1 = df[(df["latitude"].between(lat1 - radius, lat1 + radius)) &
                     (df["longitude"].between(lon1 - radius, lon1 + radius))].copy()
        
        # Apply circular distance filter for more precise filtering
        if len(sub_df1) > 0:
            distances = sub_df1.apply(
                lambda row: calculate_distance(row["latitude"], row["longitude"], lat1, lon1),
                axis=1
            )
            sub_df1 = sub_df1[distances <= radius].copy()
        
        print(f"Area: '{area1}' (found: {area_found}), Coordinates: ({lat1}, {lon1}), Radius: {radius}°, Filtered rows: {len(sub_df1)}")
    
    # Ensure sub_df1 is not None
    if sub_df1 is None:
        sub_df1 = pd.DataFrame()
    
    # Debug: Print crime breakdown
    crime_cols = [col for col in sub_df1.columns if col.startswith('act')] if len(sub_df1) > 0 else []
    crime_summary = {}
    if crime_cols and len(sub_df1) > 0:
        crime_summary = sub_df1[crime_cols].sum().to_dict()
        crime_summary = {crime_mapping.get(k, k): int(v) for k, v in crime_summary.items() if v > 0}
        print(f"  Crime breakdown: {crime_summary}")

    safety1 = get_safety_score(sub_df1)
    
    # Only generate charts if we have data
    if len(sub_df1) > 0:
        pie1 = generate_pie_chart(sub_df1)
        bar1 = generate_bar_chart(sub_df1)
    else:
        # Return empty charts if no data
        pie1 = None
        bar1 = None

    # Folium Map
    map_ = folium.Map(location=[lat1, lon1], zoom_start=13)
    for _, row in sub_df1.iterrows():
        folium.CircleMarker(
            location=[row["latitude"], row["longitude"]],
            radius=5,
            color="red",
            fill=True
        ).add_to(map_)
    HeatMap(sub_df1[["latitude", "longitude"]]).add_to(map_)
    map_path = os.path.join(templates_dir, "map.html")
    map_.save(map_path)

    # Top 3 Crimes (with readable names)
    # Find crime columns dynamically
    crime_cols = [col for col in sub_df1.columns if col.startswith('act')]
    if not crime_cols:
        # Fallback: try to use columns 1-7 if act columns not found
        crime_cols = sub_df1.columns[1:7].tolist() if len(sub_df1.columns) > 7 else sub_df1.columns[1:].tolist()
    
    # Get all crimes with counts > 0, sorted by count (descending)
    all_crimes_raw = sub_df1[crime_cols].sum().sort_values(ascending=False).to_dict()
    all_crimes = {crime_mapping.get(k, k): int(v) for k, v in all_crimes_raw.items() if v > 0}
    
    # Also keep top_3_crimes for backward compatibility, but show all crimes
    top_3_crimes = dict(list(all_crimes.items())[:3])

    # Calculate risk level from safety score
    if safety1 is None or safety1 == "N/A":
        risk_level = "UNKNOWN"
    elif safety1 < 65:
        risk_level = "HIGH"
    elif safety1 < 75:
        risk_level = "MODERATE"
    else:
        risk_level = "LOW"
    
    # Generate AI note
    ai_note = None
    if top_3_crimes and len(top_3_crimes) > 0:
        primary_crime = list(top_3_crimes.keys())[0]
        primary_count = top_3_crimes[primary_crime]
        if safety1 and safety1 != "N/A":
            score = safety1 if isinstance(safety1, int) else int(safety1)
            if score < 65:
                time_advice = "Heightened caution is recommended, especially after 8 PM."
            elif score < 75:
                time_advice = "Moderate caution is advised, particularly during evening hours."
            else:
                time_advice = "Exercise normal caution throughout the day."
            ai_note = f"Predictive analysis indicates {primary_crime} is the primary risk factor ({primary_count} incidents). {time_advice} Total reported incidents: {len(sub_df1)}."
        else:
            ai_note = f"Predictive analysis indicates {primary_crime} is the primary risk factor ({primary_count} incidents). Total reported incidents: {len(sub_df1)}."

    result = {
        "area": area1,
        "area1": area1.upper(),  # Also include area1 for compatibility with simpler frontend
        "safety_score": safety1 if safety1 is not None else "N/A",
        "risk_level": risk_level,
        "pie_chart": pie1,
        "bar_chart": bar1,
        "total_crimes": len(sub_df1),
        "top_3_crimes": top_3_crimes,  # Keep for backward compatibility
        "all_crimes": all_crimes,  # Include all crimes with counts > 0
        "ai_note": ai_note
    }

    return result