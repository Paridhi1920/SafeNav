import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getSafeRoute } from "../services/routeFinderApi";

mapboxgl.accessToken = "YOUR_MAPBOX_ACCESS_TOKEN_HERE";

const SafeRoutePage = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [userCoords, setUserCoords] = useState(null);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [route, setRoute] = useState(null);

  // 🗺️ Initialize Map and User Location
  useEffect(() => {
    // 1️⃣ Ask for location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords([longitude, latitude]);

        // 2️⃣ Initialize map
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [longitude, latitude],
          zoom: 14,
        });

        // 3️⃣ Add zoom & rotation controls
        mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        // 4️⃣ Add blue marker for your position
        markerRef.current = new mapboxgl.Marker({ color: "blue" })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setText("You are here"))
          .addTo(mapRef.current);

        // Optional: continuously update marker if user moves
        navigator.geolocation.watchPosition(
          (pos2) => {
            const { latitude: lat2, longitude: lng2 } = pos2.coords;
            markerRef.current.setLngLat([lng2, lat2]);
            mapRef.current.setCenter([lng2, lat2]);
          },
          (err) => console.error("Error watching position:", err),
          { enableHighAccuracy: true }
        );
      },
      (err) => {
        alert("Please enable location services for this feature to work.");
        console.error("Location error:", err);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // 🚗 Handle Safe Route Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await getSafeRoute(source, destination);
    setRoute(data);

    // If your API returns coordinates, plot them:
    if (mapRef.current && data?.coordinates?.length > 0) {
      const coords = data.coordinates;

      // Remove existing route if it exists
      if (mapRef.current.getSource("route")) {
        mapRef.current.removeLayer("route");
        mapRef.current.removeSource("route");
      }

      // Add new route
      mapRef.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coords,
          },
        },
      });

      mapRef.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#3b82f6", "line-width": 4 },
      });

      // Fit map to route
      const bounds = coords.reduce(
        (b, coord) => b.extend(coord),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      mapRef.current.fitBounds(bounds, { padding: 50 });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold mb-3">Safe Route Finder</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Find Route
        </button>
      </form>

      {/* 🗺️ Mapbox container */}
      <div
        ref={mapContainerRef}
        className="w-full h-96 rounded-lg border border-gray-300"
      />

      {route && (
        <div className="bg-gray-100 p-3 rounded border mt-4">
          <h3 className="font-semibold">Route Data:</h3>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(route, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SafeRoutePage;