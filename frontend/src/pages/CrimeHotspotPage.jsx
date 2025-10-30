import React, { useEffect, useState } from "react";
import { getHotspots, getHotspotMap } from "../services/hotspotApi";

const CrimeHotspotPage = () => {
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    getHotspots().then((data) => {
      setHotspots(data.hotspots);
    });
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-3">Crime Hotspots</h2>

      {/* Map iframe */}
      <iframe
        src={getHotspotMap()}
        title="Crime Hotspot Map"
        style={{ width: "100%", height: "500px", border: "1px solid #ccc" }}
      />

      {/* Hotspot list */}
      <ul className="mt-4 list-disc pl-5">
        {hotspots.map((h, i) => (
          <li key={i}>
            Lat: {h.latitude}, Lon: {h.longitude}, Crimes: {h.total_crimes}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CrimeHotspotPage;