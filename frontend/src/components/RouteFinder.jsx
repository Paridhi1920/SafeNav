import React from "react";
import "./RouteFinder.css";

const RouteFinder = () => {
  return (
    <div className="route-finder">
      <h2>🛣️ Safe Route Finder</h2>
      <p>Enter your source and destination to get the safest path.</p>
      <div className="form">
        <input type="text" placeholder="Enter Source" />
        <input type="text" placeholder="Enter Destination" />
        <button>Find Route</button>
      </div>
      <div className="map-placeholder">[Map will be shown here]</div>
    </div>
  );
};

export default RouteFinder;