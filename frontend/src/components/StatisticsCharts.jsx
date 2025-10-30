import React from "react";

const StatisticsCharts = ({ children }) => {
  return (
    <div className="statistics-charts grid gap-6">
      {children ? children : <p>Loading charts...</p>}
    </div>
  );
};

export default StatisticsCharts;
