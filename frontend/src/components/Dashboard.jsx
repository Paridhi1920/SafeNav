import React from "react";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import "./Dashboard.css";

// ChartJS register
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  // Mock data
  const monthlyCrimeData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Crimes",
        data: [40, 55, 35, 60, 48, 70],
        borderColor: "#82ca9d",
        backgroundColor: "rgba(130,202,157,0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
      },
    ],
  };

  const areaWiseData = {
    labels: ["Vijay Nagar", "Palasia", "Rau", "Bhawarkuan", "Rajwada"],
    datasets: [
      {
        data: [120, 80, 40, 90, 110],
        backgroundColor: ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a569bd"],
        hoverOffset: 10,
      },
    ],
  };

  const topDangerous = [
    { area: "Vijay Nagar", total: 120 },
    { area: "Rajwada", total: 110 },
    { area: "Bhawarkuan", total: 90 },
    { area: "Palasia", total: 80 },
    { area: "Rau", total: 40 },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">📊 Crime Analytics Dashboard</h1>
      <p className="dashboard-subtitle">
        Visualize Indore's crime patterns and risk distribution.
      </p>

      <div className="charts-container">
        {/* Line Chart */}
        <div className="chart-card">
          <h3>Crime Growth / Decline Trend</h3>
          <Line data={monthlyCrimeData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
        </div>

        {/* Pie Chart */}
        <div className="chart-card">
          <h3>Area-wise Crime Distribution</h3>
          <Pie data={areaWiseData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <h3>Top Dangerous Areas (City-wise Stats)</h3>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Area</th>
              <th>Total Crimes</th>
            </tr>
          </thead>
          <tbody>
            {topDangerous.map((a, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{a.area}</td>
                <td>{a.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;