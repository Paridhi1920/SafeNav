import React, { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

// Mapping of Act numbers to real crime names
const actNames = {
  act379: "Theft",
  act13: "Illegal Weapons",
  act279: "Rash Driving",
  act323: "Assault",
  act363: "Kidnapping",
  act302: "Murder",
};

const dummyData = {
  2020: { January: 220, February: 180, March: 150, April: 100, May: 130, June: 160, July: 210, August: 190, September: 175, October: 230, November: 200, December: 180 },
  2021: { January: 250, February: 230, March: 190, April: 170, May: 210, June: 260, July: 300, August: 280, September: 250, October: 270, November: 220, December: 240 },
  2022: { January: 280, February: 250, March: 240, April: 220, May: 300, June: 320, July: 350, August: 370, September: 330, October: 310, November: 290, December: 310 },
  2023: { January: 300, February: 320, March: 310, April: 290, May: 340, June: 360, July: 400, August: 420, September: 390, October: 410, November: 380, December: 360 },
  2024: { January: 350, February: 340, March: 360, April: 380, May: 420, June: 440, July: 470, August: 490, September: 460, October: 480, November: 450, December: 470 },
  2025: { January: 400, February: 420, March: 450, April: 480, May: 520, June: 540, July: 570, August: 600, September: 560, October: 590, November: 580, December: 610 },
};

const baseCrimeDistribution = {
  act379: 45,
  act13: 12,
  act279: 20,
  act323: 28,
  act363: 15,
  act302: 8,
};

const monthsOrder = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const StatisticsPage = () => {
  const [filters, setFilters] = useState({
    year: "All",
    month: "All",
    crime_type: "All",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleApply = () => setAppliedFilters({ ...filters });

  // Filtered data logic
  const filteredData = useMemo(() => {
    const selectedYears =
      appliedFilters.year === "All" ? Object.keys(dummyData) : [appliedFilters.year];

    let monthlyValues = {};
    selectedYears.forEach((year) => {
      Object.entries(dummyData[year]).forEach(([month, value]) => {
        let adjustedValue = value;
        if (appliedFilters.crime_type !== "All") {
          const crimeWeight =
            {
              act379: 1.0,
              act13: 0.4,
              act279: 0.6,
              act323: 0.7,
              act363: 0.5,
              act302: 0.3,
            }[Object.keys(actNames).find(
              (key) => actNames[key] === appliedFilters.crime_type
            )] || 1;
          adjustedValue = Math.round(value * crimeWeight);
        }
        if (!monthlyValues[month]) monthlyValues[month] = 0;
        monthlyValues[month] += adjustedValue;
      });
    });

    if (appliedFilters.month !== "All") {
      monthlyValues = {
        [appliedFilters.month]: monthlyValues[appliedFilters.month] || 0,
      };
    }

    return monthlyValues;
  }, [appliedFilters]);

  const yearlyLabels = Object.keys(dummyData);
  const yearlyTotals = yearlyLabels.map((yr) =>
    Object.values(dummyData[yr]).reduce((a, b) => a + b, 0)
  );

  const monthlyLabels = Object.keys(filteredData);
  const monthlyCounts = Object.values(filteredData);

  // Adjust crime distribution
  const adjustedCrimeDistribution = Object.keys(baseCrimeDistribution).reduce(
    (acc, key) => {
      let modifier = 1;
      if (appliedFilters.year !== "All")
        modifier += (parseInt(appliedFilters.year) - 2019) * 0.05;
      if (appliedFilters.month !== "All")
        modifier += monthsOrder.indexOf(appliedFilters.month) * 0.02;
      acc[key] = Math.round(baseCrimeDistribution[key] * modifier);
      return acc;
    },
    {}
  );

  const cardClasses =
    "bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition duration-300";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-10 text-blue-700 text-center">
        📊 Crime Statistics Dashboard
      </h2>

      {/* Filters Section */}
      <form
        className="flex flex-wrap justify-center gap-4 mb-12"
        onSubmit={(e) => e.preventDefault()}
      >
        <select
          name="year"
          value={filters.year}
          onChange={handleChange}
          className="border p-2 rounded-md shadow-sm bg-white"
        >
          <option value="All">All Years</option>
          {Object.keys(dummyData).map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <select
          name="month"
          value={filters.month}
          onChange={handleChange}
          className="border p-2 rounded-md shadow-sm bg-white"
        >
          <option value="All">All Months</option>
          {monthsOrder.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <select
          name="crime_type"
          value={filters.crime_type}
          onChange={handleChange}
          className="border p-2 rounded-md shadow-sm bg-white"
        >
          <option value="All">All Crime Types</option>
          {Object.values(actNames).map((crime) => (
            <option key={crime}>{crime}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleApply}
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
        >
          Apply Filters
        </button>
      </form>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* 1️⃣ Crime Type Distribution */}
        <div className={`${cardClasses} md:col-span-2`} style={{ height: 350 }}>
          <h3 className="font-semibold text-gray-700 mb-4 text-center">
            Crime Type Distribution
          </h3>
          <Pie
            data={{
              labels: Object.values(actNames),
              datasets: [
                {
                  data: Object.values(adjustedCrimeDistribution),
                  backgroundColor: [
                    "#36A2EB",
                    "#FF6384",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40",
                  ],
                  hoverOffset: 12,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "bottom" },
                tooltip: {
                  callbacks: {
                    label: (ctx) => `${ctx.label}: ${ctx.formattedValue} cases`,
                  },
                },
              },
            }}
          />
        </div>

        {/* 2️⃣ Monthly Crime Trend */}
        <div className={cardClasses} style={{ height: 320 }}>
          <h3 className="font-semibold text-gray-700 mb-4 text-center">
            Monthly Crime Trend{" "}
            {appliedFilters.year !== "All" && `(${appliedFilters.year})`}
          </h3>
          <Bar
            data={{
              labels: monthlyLabels,
              datasets: [
                {
                  label: "Crimes per Month",
                  data: monthlyCounts,
                  backgroundColor: "rgba(255,99,132,0.6)",
                  borderColor: "rgba(255,99,132,1)",
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: { beginAtZero: true },
                x: { grid: { display: false } },
              },
            }}
          />
        </div>

        {/* 3️⃣ Yearly Crime Trend */}
        <div className={cardClasses} style={{ height: 320 }}>
          <h3 className="font-semibold text-gray-700 mb-4 text-center">
            Yearly Crime Trend
          </h3>
          <Line
            data={{
              labels: yearlyLabels,
              datasets: [
                {
                  label: "Total Crimes",
                  data: yearlyTotals,
                  fill: true,
                  borderColor: "#2563eb",
                  backgroundColor: "rgba(37,99,235,0.2)",
                  tension: 0.4,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
