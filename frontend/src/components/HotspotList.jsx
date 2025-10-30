import React, { useState } from "react";
import { getAreaInfo } from "../services/hotspotApi";
import "./HotspotList.css";

const HotspotList = () => {
  const [area, setArea] = useState("");
  const [result, setResult] = useState(null);

  const handleCheck = async () => {
    if (!area) return alert("Please enter an area name!");
    const res = await getAreaInfo(area);
    setResult(res);
  };

  return (
    <div className="hotspot-list">
      <h2>🛡️ Area Safety Dashboard</h2>

      <div className="inputs">
        <input
          type="text"
          placeholder="Enter Area Name"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />
      </div>

      <div className="buttons">
        <button onClick={handleCheck}>Check Safety</button>
      </div>

      {/* ✅ SINGLE AREA RESULT */}
      {result && (
        <div className="result">
          <h3>{result.area1 || "Unknown Area"}</h3>
          <p>Safety Score: {result.safety_score} / 100</p>
          {result.risk_level && <p>Risk Level: {result.risk_level}</p>}

          <h4>Top 3 Crimes:</h4>
          <ul>
            {result.top_3_crimes &&
              Object.entries(result.top_3_crimes).map(([crime, count]) => (
                <li key={crime}>
                  {crime}: {count}
                </li>
              ))}
          </ul>

          <div className="charts">
            {result.pie_chart && (
              <img
                src={`data:image/png;base64,${result.pie_chart}`}
                alt="Pie Chart"
              />
            )}
            {result.bar_chart && (
              <img
                src={`data:image/png;base64,${result.bar_chart}`}
                alt="Bar Chart"
              />
            )}
          </div>

          {result.ai_note && <p className="note">{result.ai_note}</p>}
        </div>
      )}
    </div>
  );
};

export default HotspotList;