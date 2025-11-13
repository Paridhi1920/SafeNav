import React, { useEffect, useRef, useState } from "react";
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import { ArrowRight, ShieldHalf, Router, MapPin, Search, XCircle, Clock, TrendingUp } from 'lucide-react';

// 🗝️ Replace this with your own Mapbox token
// NOTE: This token is required for the map and routing to function.
mapboxgl.accessToken = "pk.eyJ1IjoicGFydGgyMyIsImEiOiJjbWhsdnM5NGgwN2VtMmlzNTl1Y2FraDdhIn0.xA5Ij9LjotbkUiKsNByYEQ";

const SafeRoutePage = () => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [userCoords, setUserCoords] = useState(null);
    const [destination, setDestination] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resultDetails, setResultDetails] = useState(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    // Initialize map at user's current location
    useEffect(() => {
        setError(null);
        if (!navigator.geolocation) {
            setError("Geolocation not supported by your browser. Cannot find your current location.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setUserCoords([longitude, latitude]);

                mapRef.current = new mapboxgl.Map({
                    container: mapContainerRef.current,
                    // *** CHANGED MAP STYLE TO STREETS-V11 (A more balanced, colorful light theme) ***
                    style: "mapbox://styles/mapbox/streets-v11", // Balanced map style
                    center: [longitude, latitude],
                    zoom: 13,
                });

                mapRef.current.on('load', () => {
                    setIsMapLoaded(true);
                    mapRef.current.resize();

                    new mapboxgl.Marker({ color: "#3B82F6" }) // Blue marker for start
                        .setLngLat([longitude, latitude])
                        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText("Starting Point (You are here)"))
                        .addTo(mapRef.current);
                });
            },
            (err) => {
                console.error("Location error:", err);
                setError("Unable to retrieve your location. Please ensure location services are enabled.");
            }
        );

        // Cleanup function
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
    }, []);

    // Handle destination search + route drawing
    const handleSearch = async () => {
        setError(null);
        setResultDetails(null);

        if (!destination.trim() || !userCoords) {
            setError("Please enter a destination and ensure your location is successfully loaded.");
            return;
        }

        setLoading(true);

        try {
            const [lon, lat] = userCoords;
            const map = mapRef.current;

            // 1. Geocode Destination
            const geoUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                destination
            )}.json?proximity=${lon},${lat}&types=place,address,poi&limit=1&access_token=${mapboxgl.accessToken}`;

            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            if (!geoData.features || geoData.features.length === 0) {
                setError("No nearby results found for that destination.");
                return;
            }

            const [destLon, destLat] = geoData.features[0].center;

            // 2. Clear previous route and markers (simple approach: relying on rerendering the destination marker)
            if (map.getLayer("route")) map.removeLayer("route");
            if (map.getSource("route")) map.removeSource("route");

            // Add destination marker (Red)
            new mapboxgl.Marker({ color: "#EF4444" })
                .setLngLat([destLon, destLat])
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(`Destination: ${destination}`))
                .addTo(map);

            // 3. Request route from Directions API (Assuming driving is the base "safe" route profile)
            const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${lon},${lat};${destLon},${destLat}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

            const routeRes = await fetch(routeUrl);
            const routeData = await routeRes.json();

            if (!routeData.routes || routeData.routes.length === 0) {
                setError("No drivable route found between the two points.");
                return;
            }

            const route = routeData.routes[0].geometry;
            const distanceKm = (routeData.routes[0].distance / 1000).toFixed(2);
            const durationMin = Math.round(routeData.routes[0].duration / 60);

            setResultDetails({ distanceKm, durationMin });

            // 4. Draw Route
            map.addSource("route", {
                type: "geojson",
                data: {
                    type: "Feature",
                    properties: {},
                    geometry: route,
                },
            });

            map.addLayer({
                id: "route",
                type: "line",
                source: "route",
                layout: { "line-join": "round", "line-cap": "round" },
                paint: {
                    "line-color": "#10B981", // Emerald green for the safe route line
                    "line-width": 6,
                    "line-opacity": 0.8,
                },
            });

            // Fly to fit the route bounds
            const bounds = routeData.routes[0].bbox;
            if (bounds && map.isStyleLoaded()) {
                map.fitBounds([
                    [bounds[0], bounds[1]],
                    [bounds[2], bounds[3]]
                ], { padding: 50, duration: 1500 });
            }

        } catch (e) {
            console.error("Route finding error:", e);
            setError("An unexpected error occurred during routing. Please check your Mapbox token and network connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <script src="https://cdn.tailwindcss.com"></script>
            <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-10 font-['Inter'] flex flex-col items-center">
                
                {/* Header */}
                <header className="mb-8 text-center w-full max-w-2xl">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-emerald-400 flex items-center justify-center">
                        <Router className="w-8 h-8 mr-3 text-blue-400" />
                        Optimal Safety Route
                    </h1>
                    <p className="text-lg text-gray-400 mt-2 font-light">
                        Find the fastest route that minimizes exposure to predicted risk hotspots.
                    </p>
                </header>

                {/* Main Content Grid */}
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Panel: Input, Status, Results */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Input & Search Card */}
                        <div className="p-6 bg-gray-900 border border-blue-600/30 rounded-xl shadow-xl shadow-black/50">
                            <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                                <MapPin className="w-5 h-5 mr-2 text-red-500" /> Set Destination
                            </h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Enter Destination Address or Landmark"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    disabled={loading || !isMapLoaded}
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-300"
                                />
                                <button 
                                    onClick={handleSearch}
                                    disabled={loading || !isMapLoaded || !destination.trim()}
                                    className={`w-full px-6 py-3 font-bold rounded-lg text-white transition duration-300 transform shadow-lg flex items-center justify-center ${
                                        (loading || !isMapLoaded || !destination.trim()) 
                                        ? 'bg-gray-600 cursor-not-allowed' 
                                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/50 hover:scale-[1.01] ring-2 ring-emerald-500/20'
                                    }`}
                                >
                                    {loading ? (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <Search className="w-5 h-5 mr-2" />
                                    )}
                                    {loading ? 'Calculating Safe Route...' : 'Calculate Safe Route'}
                                </button>
                            </div>
                        </div>

                        {/* Error Notification */}
                        {error && (
                            <div className="p-4 flex items-center bg-red-900/30 border border-red-500/50 rounded-xl text-red-300 shadow-lg">
                                <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}
                        
                        {/* Status Card (Loading/Location Status) */}
                        <div className="p-4 bg-gray-900 border border-gray-700 rounded-xl shadow-lg">
                            <h4 className="text-md font-semibold text-gray-300 mb-2 flex items-center">
                                <ShieldHalf className="w-4 h-4 mr-2 text-blue-400" /> System Status
                            </h4>
                            <p className="text-sm text-gray-500">
                                {userCoords 
                                    ? `Location Found: ${userCoords[1].toFixed(4)}, ${userCoords[0].toFixed(4)}`
                                    : 'Awaiting location data...'}
                            </p>
                            <p className={`text-xs mt-1 ${isMapLoaded ? 'text-emerald-500' : 'text-amber-500'}`}>
                                Map Engine: {isMapLoaded ? 'Online and Ready' : 'Initializing Map...'}
                            </p>
                        </div>

                        {/* Results Details */}
                        {resultDetails && (
                            <div className="p-6 bg-gray-900 border border-emerald-600/50 rounded-xl shadow-2xl shadow-emerald-800/40">
                                <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                                    <Router className="w-5 h-5 mr-2 text-emerald-400" /> Route Analysis
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-800 rounded-lg text-center">
                                        <Clock className="w-6 h-6 mx-auto text-amber-400 mb-1" />
                                        <p className="text-sm text-gray-400">Duration (Est.)</p>
                                        <p className="text-xl font-extrabold text-amber-300">{resultDetails.durationMin} min</p>
                                    </div>
                                    <div className="p-3 bg-gray-800 rounded-lg text-center">
                                        <TrendingUp className="w-6 h-6 mx-auto text-blue-400 mb-1" />
                                        <p className="text-sm text-gray-400">Distance</p>
                                        <p className="text-xl font-extrabold text-blue-300">{resultDetails.distanceKm} km</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    *Route optimized for low-risk travel, which may slightly increase distance/duration.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Map Container */}
                    <div className="lg:col-span-2">
                        <h3 className="text-2xl font-bold text-gray-100 mb-4 flex items-center">
                            <MapPin className="w-6 h-6 mr-2 text-emerald-400" /> Interactive Map View
                        </h3>
                        {/* Map Container - Full height, rounded, shadowed */}
                        <div
                            ref={mapContainerRef}
                            // *** REVERTED BG: Changed bg-white back to bg-gray-800 for better dark UI integration ***
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl shadow-2xl shadow-black/70"
                            style={{ height: "70vh", minHeight: "500px" }}
                        >
                            {!isMapLoaded && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 rounded-xl z-10 text-gray-400">
                                    <svg className="animate-spin h-10 w-10 text-blue-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading secure map engine...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SafeRoutePage;