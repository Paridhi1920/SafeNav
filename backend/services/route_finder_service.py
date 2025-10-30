import os
import requests
from utils.data_preprocessing import load_crime_data
from config.config import Config

def get_hotspots_for_routing(threshold=5):
    """
    Get hotspot coordinates for filtering routes.
    Threshold = min total crimes to consider as dangerous
    """
    df = load_crime_data()
    crime_columns = ["act379", "act13", "act279", "act323", "act363", "act302"]
    df["total_crimes"] = df[crime_columns].sum(axis=1)

    grouped = (
        df.groupby(["latitude", "longitude"])["total_crimes"]
        .sum()
        .reset_index()
    )

    # filter hotspots above threshold
    hotspots = grouped[grouped["total_crimes"] >= threshold]
    return hotspots.to_dict(orient="records")


def is_point_near_hotspot(lat, lon, hotspots, radius=0.005):
    """
    Check if a point is near any hotspot (approx 500m radius)
    """
    for h in hotspots:
        if abs(lat - h["latitude"]) <= radius and abs(lon - h["longitude"]) <= radius:
            return True
    return False


def get_safe_route(origin, destination, mode="driving"):
    """
    Get safest route between origin and destination using Google Maps Directions API
    Avoid hotspots by checking steps
    """
    api_key = os.getenv("GOOGLE_MAPS_API_KEY", Config.GOOGLE_MAPS_API_KEY)
    url = f"https://maps.googleapis.com/maps/api/directions/json"

    params = {
        "origin": origin,
        "destination": destination,
        "mode": mode,
        "alternatives": "true",
        "key": api_key,
    }

    response = requests.get(url, params=params)
    if response.status_code != 200:
        return {"error": "Failed to fetch directions from Google API"}

    data = response.json()
    if "routes" not in data or len(data["routes"]) == 0:
        return {"error": "No routes found"}

    hotspots = get_hotspots_for_routing()
    safe_routes = []

    for route in data["routes"]:
        legs = route.get("legs", [])
        unsafe = False

        # check every step
        for leg in legs:
            for step in leg.get("steps", []):
                lat = step["end_location"]["lat"]
                lon = step["end_location"]["lng"]

                if is_point_near_hotspot(lat, lon, hotspots):
                    unsafe = True
                    break

        if not unsafe:
            safe_routes.append(route)

    # agar koi safe route nahi mila to fallback
    if not safe_routes:
        safe_routes = [data["routes"][0]]

    return {"routes": safe_routes}
