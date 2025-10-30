import folium
import os
import requests
from config.config import Config

def generate_hotspot_map(hotspots, output_path="backend/static/hotspot_map.html"):
    """
    Create an interactive map with crime hotspots using Folium.
    """
    # Ensure that static folder exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    if len(hotspots) == 0:
        center_lat, center_lon = 22.7196, 75.8577  # Indore default
    else:
        center_lat = hotspots[0]["latitude"]
        center_lon = hotspots[0]["longitude"]

    crime_map = folium.Map(location=[center_lat, center_lon], zoom_start=12)

    for hotspot in hotspots:
        lat = hotspot["latitude"]
        lon = hotspot["longitude"]
        crimes = hotspot["total_crimes"]

        popup_text = f"Crimes: {crimes}<br>Lat: {lat}, Lon: {lon}"

        folium.CircleMarker(
            location=[lat, lon],
            radius=5 + crimes * 0.5,
            color="red" if crimes > 5 else "orange",
            fill=True,
            fill_opacity=0.6,
            popup=popup_text,
        ).add_to(crime_map)

    # Save map into static folder
    crime_map.save(output_path)
    return output_path

def reverse_geocode(lat, lon):
    """Get address from lat/lon using Google Maps API"""
    api_key = os.getenv("GOOGLE_MAPS_API_KEY", Config.GOOGLE_MAPS_API_KEY)
    url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}&key={api_key}"

    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if data["results"]:
            return data["results"][0]["formatted_address"]
    return "Unknown Area"
