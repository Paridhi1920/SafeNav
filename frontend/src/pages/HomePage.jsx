import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">AI Powered Crime Hotspot & Safety System</h1>
      <div className="space-y-3">
        <Link to="/dashboard" className="block text-blue-600">Dashboard</Link>
        <Link to="/hotspots" className="block text-blue-600">Crime Hotspots</Link>
        <Link to="/safe-route" className="block text-blue-600">Safe Route Finder</Link>
        <Link to="/statistics" className="block text-blue-600">Crime Statistics</Link>
      </div>
    </div>
  );
};

export default HomePage;