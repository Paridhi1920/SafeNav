import React, { useState } from "react";
import { getSafeRoute } from "../services/routeFinderApi";

const SafeRoutePage = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [route, setRoute] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await getSafeRoute(source, destination);
    setRoute(data);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-3">Safe Route Finder</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Find Route
        </button>
      </form>

      {route && (
        <div className="mt-4">
          <h3 className="font-semibold">Route:</h3>
          <pre>{JSON.stringify(route, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SafeRoutePage;