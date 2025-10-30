import React, { useEffect, useState } from "react";
import { getDashboardData } from "../services/dashboardApi";

const DashboardPage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    getDashboardData().then(setData).catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-3">Dashboard</h2>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Loading dashboard data...</p>
      )}
    </div>
  );
};

export default DashboardPage;