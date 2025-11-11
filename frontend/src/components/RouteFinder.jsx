import React, { useEffect, useRef, useState } from "react";
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import "./RouteFinder.css";

// 🗝️ Replace this with your own Mapbox token
mapboxgl.accessToken = "pk.eyJ1IjoicGFydGgyMyIsImEiOiJjbWhsdnM5NGgwN2VtMmlzNTl1Y2FraDdhIn0.xA5Ij9LjotbkUiKsNByYEQ";

const RouteFinder = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [userCoords, setUserCoords] = useState(null);
  const [destination, setDestination] = useState("");
  const [destinationCoords, setDestinationCoords] = useState(null);

  // Initialize map at user’s current location
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords([longitude, latitude]);

        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [longitude, latitude],
          zoom: 13,
        });

        new mapboxgl.Marker({ color: "blue" })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setText("You are here"))
          .addTo(mapRef.current);
      },
      (err) => console.error("Location error:", err)
    );
  }, []);

  // Handle destination search + route drawing
  const handleSearch = async () => {
    if (!destination || !userCoords) return;

    const [lon, lat] = userCoords;
    const geoUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      destination
    )}.json?proximity=${lon},${lat}&types=place,address,poi&limit=1&access_token=${mapboxgl.accessToken}`;

    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.features || geoData.features.length === 0) {
      alert("No nearby results found!");
      return;
    }

    const [destLon, destLat] = geoData.features[0].center;
    setDestinationCoords([destLon, destLat]);

    // Add destination marker
    new mapboxgl.Marker({ color: "red" })
      .setLngLat([destLon, destLat])
      .setPopup(new mapboxgl.Popup().setText(destination))
      .addTo(mapRef.current);

    // Request route from Directions API
    const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${lon},${lat};${destLon},${destLat}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    const routeRes = await fetch(routeUrl);
    const routeData = await routeRes.json();

    if (!routeData.routes || routeData.routes.length === 0) {
      alert("No route found!");
      return;
    }

    const route = routeData.routes[0].geometry;

    // If a previous route layer exists, remove it
    if (mapRef.current.getSource("route")) {
      mapRef.current.removeLayer("route");
      mapRef.current.removeSource("route");
    }

    // Add route as a new layer
    mapRef.current.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: route,
      },
    });

    mapRef.current.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": "#00bcd4",
        "line-width": 5,
      },
    });

    // Fly to destination
    mapRef.current.flyTo({ center: [destLon, destLat], zoom: 12 });
  };

  return (
    <div className="route-finder">
      <h2>🛣️ Safe Route Finder</h2>
      <div className="form">
        <input
          type="text"
          placeholder="Enter Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <button onClick={handleSearch}>Find Route</button>
      </div>
      <div
        ref={mapContainerRef}
        className="map-placeholder"
        style={{ height: "400px", borderRadius: "12px" }}
      />
    </div>
  );
};

export default RouteFinder;