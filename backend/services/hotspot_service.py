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
    if area_name in area_coords:
        return area_coords[area_name]
    return (22.72, 75.87)

# Calculate Safety Score
def get_safety_score(sub_df):
    if len(sub_df) == 0:
        return None
    total_crimes = sub_df['crime_count'].sum() if 'crime_count' in sub_df.columns else len(sub_df)
    max_crimes = df['crime_count'].max() if 'crime_count' in df.columns else 200
    return max(0, 100 - int((total_crimes / max_crimes) * 100))

# Chart Generators
def generate_pie_chart(sub_df):
    counts = sub_df.iloc[:, 1:7].sum()
    counts.index = [crime_mapping.get(c, c) for c in counts.index]
    plt.figure(figsize=(3.3, 3.3))
    plt.pie(counts, labels=counts.index, autopct="%1.1f%%")
    buf = BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight")
    plt.close()
    return base64.b64encode(buf.getvalue()).decode("utf-8")

def generate_bar_chart(sub_df):
    counts = sub_df.iloc[:, 1:7].sum()
    counts.index = [crime_mapping.get(c, c) for c in counts.index]
    plt.figure(figsize=(4.2, 3.2))
    counts.plot(kind="bar")
    plt.ylabel("Crime Count")
    buf = BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight")
    plt.close()
    return base64.b64encode(buf.getvalue()).decode("utf-8")

# Main Function (Single Area Only)
def get_area_analysis(area1):
    lat1, lon1 = get_nearest_area(area1)
    sub_df1 = df[(df["latitude"].between(lat1 - 0.01, lat1 + 0.01)) &
                 (df["longitude"].between(lon1 - 0.01, lon1 + 0.01))]

    safety1 = get_safety_score(sub_df1)
    pie1 = generate_pie_chart(sub_df1)
    bar1 = generate_bar_chart(sub_df1)

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
    top_3_crimes_raw = sub_df1.iloc[:, 1:7].sum().sort_values(ascending=False).head(3).to_dict()
    top_3_crimes = {crime_mapping.get(k, k): v for k, v in top_3_crimes_raw.items()}

    result = {
        "area": area1,
        "safety_score": safety1 if safety1 is not None else "N/A",
        "pie_chart": pie1,
        "bar_chart": bar1,
        "total_crimes": len(sub_df1),
        "top_3_crimes": top_3_crimes
    }

    return result