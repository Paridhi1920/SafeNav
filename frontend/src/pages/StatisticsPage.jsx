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
import { Filter, BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react';

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

// Dark Chart Options Definition
const darkChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                color: '#E5E7EB', // gray-200 for text
                font: { size: 14, family: "Inter" }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(31, 41, 55, 0.9)',
            titleColor: '#F9FAFB',
            bodyColor: '#D1D5DB',
            borderColor: '#374151',
            borderWidth: 1,
            cornerRadius: 8,
        }
    },
    scales: {
        x: {
            ticks: { color: '#9CA3AF' },
            grid: { color: 'rgba(55, 65, 81, 0.5)' },
            border: { color: '#374151' }
        },
        y: {
            ticks: { color: '#9CA3AF' },
            grid: { color: 'rgba(55, 65, 81, 0.5)' },
            border: { color: '#374151' },
            beginAtZero: true
        }
    }
};

const pieChartOptions = {
    ...darkChartOptions,
    scales: {}, // Remove scales for pie chart
    plugins: {
        ...darkChartOptions.plugins,
        legend: { position: 'bottom' }
    }
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
    act379: 45, // Theft
    act13: 12, // Illegal Weapons
    act279: 20, // Rash Driving
    act323: 28, // Assault
    act363: 15, // Kidnapping
    act302: 8, // Murder
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
                
                // If filtering by a single crime type, simulate reducing the total crime count
                if (appliedFilters.crime_type !== "All") {
                    const crimeKey = Object.keys(actNames).find(key => actNames[key] === appliedFilters.crime_type);
                    const crimeWeight = {
                        act379: 1.0, act13: 0.4, act279: 0.6, act323: 0.7, act363: 0.5, act302: 0.3,
                    }[crimeKey] || 1;
                    adjustedValue = Math.round(value * crimeWeight * (selectedYears.length / Object.keys(dummyData).length));
                }

                if (!monthlyValues[month]) monthlyValues[month] = 0;
                monthlyValues[month] += adjustedValue;
            });
        });

        if (appliedFilters.month !== "All") {
            // If filtering by month, only keep that month
            monthlyValues = {
                [appliedFilters.month]: monthlyValues[appliedFilters.month] || 0,
            };
        } else if (appliedFilters.year !== "All") {
            // If only one year is selected, we need to order the months correctly
            const orderedValues = {};
            monthsOrder.forEach(m => {
                if (monthlyValues[m] !== undefined) orderedValues[m] = monthlyValues[m];
            });
            monthlyValues = orderedValues;
        }


        return monthlyValues;
    }, [appliedFilters]);

    // Data for Yearly Trend Chart
    const yearlyLabels = Object.keys(dummyData).sort();
    const yearlyTotals = yearlyLabels.map((yr) =>
        Object.values(dummyData[yr]).reduce((a, b) => a + b, 0)
    );

    // Data for Monthly Trend Chart
    const monthlyLabels = Object.keys(filteredData);
    const monthlyCounts = Object.values(filteredData);

    // Data for Crime Distribution Chart (Adjusted by filter to simulate change)
    const adjustedCrimeDistribution = Object.keys(baseCrimeDistribution).reduce(
        (acc, key) => {
            let modifier = 1;
            // Increase modifier for later years to show growth
            if (appliedFilters.year !== "All") {
                modifier += (parseInt(appliedFilters.year) - 2019) * 0.08;
            } else {
                modifier += (Object.keys(dummyData).length) * 0.05; // Base increase for 'All Years'
            }
            
            // Apply month modifier to simulate seasonal changes
            if (appliedFilters.month !== "All") {
                const monthIndex = monthsOrder.indexOf(appliedFilters.month);
                modifier += (monthIndex - 6) * 0.03; // Months around July/Aug are higher
            }
            
            acc[key] = Math.max(5, Math.round(baseCrimeDistribution[key] * modifier)); // Min count of 5
            return acc;
        },
        {}
    );

    const cardClasses =
        "bg-gray-900 p-6 rounded-xl shadow-2xl shadow-black/50 border border-gray-800/50 transition duration-300 transform hover:shadow-gray-700/30";

    return (
        <>
            <script src="https://cdn.tailwindcss.com"></script>
            {/* Main Container - Dark Theme */}
            <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-10 font-['Inter']">

                {/* Header Section */}
                <header className="mb-12 text-center border-b border-gray-800 pb-6">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-blue-400 flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 mr-3 text-red-500" />
                        Temporal Risk Analysis
                    </h1>
                    <p className="text-lg text-gray-400 mt-2 font-light max-w-3xl mx-auto">
                        Deep dive into historical crime trends using advanced time-series filtering.
                    </p>
                </header>

                {/* Filters Section */}
                <div className="w-full max-w-5xl mx-auto mb-12 p-6 bg-gray-900 border border-blue-600/30 rounded-xl shadow-xl shadow-blue-900/40">
                    <div className="flex items-center mb-4">
                        <Filter className="w-5 h-5 mr-2 text-blue-400" />
                        <h3 className="text-xl font-bold text-gray-100">Analysis Filters</h3>
                    </div>
                    
                    <form
                        className="flex flex-wrap items-end justify-center gap-4"
                        onSubmit={(e) => e.preventDefault()}
                    >
                        {/* Select Controls */}
                        <div className="flex flex-wrap gap-4 flex-grow justify-center lg:justify-start">
                            <select
                                name="year"
                                value={filters.year}
                                onChange={handleChange}
                                className="border p-3 rounded-lg shadow-inner bg-gray-800 border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
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
                                className="border p-3 rounded-lg shadow-inner bg-gray-800 border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
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
                                className="border p-3 rounded-lg shadow-inner bg-gray-800 border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
                            >
                                <option value="All">All Crime Types</option>
                                {Object.values(actNames).map((crime) => (
                                    <option key={crime}>{crime}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Apply Button */}
                        <button
                            type="button"
                            onClick={handleApply}
                            className="bg-red-600 text-white px-8 py-3 rounded-lg shadow-lg shadow-red-500/50 hover:bg-red-700 transition transform hover:scale-[1.02] font-bold w-full lg:w-auto mt-4 lg:mt-0"
                        >
                            Apply Filters
                        </button>
                    </form>
                </div>


                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">

                    {/* 1️⃣ Crime Type Distribution (Full Width on Mobile) */}
                    <div className={`${cardClasses} lg:col-span-2`} style={{ height: 400 }}>
                        <div className="flex items-center justify-center mb-4">
                            <PieChart className="w-6 h-6 mr-2 text-amber-400" />
                            <h3 className="font-bold text-gray-100 text-xl">
                                Crime Type Distribution 
                                {appliedFilters.year !== "All" && appliedFilters.month !== "All" ? ` (${appliedFilters.month} ${appliedFilters.year})` : ''}
                            </h3>
                        </div>
                        <div className="h-[calc(100%-40px)] flex justify-center items-center">
                            <div className="w-full max-w-xl h-full">
                                <Pie
                                    data={{
                                        labels: Object.values(actNames),
                                        datasets: [
                                            {
                                                data: Object.values(adjustedCrimeDistribution),
                                                backgroundColor: [
                                                    "#3B82F6", // Blue
                                                    "#EF4444", // Red
                                                    "#F59E0B", // Amber
                                                    "#10B981", // Emerald
                                                    "#8B5CF6", // Violet
                                                    "#06B6D4", // Cyan
                                                ],
                                                hoverOffset: 15,
                                                borderColor: '#111827',
                                                borderWidth: 3,
                                            },
                                        ],
                                    }}
                                    options={pieChartOptions}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2️⃣ Monthly Crime Trend */}
                    <div className={cardClasses} style={{ height: 380 }}>
                        <div className="flex items-center mb-4">
                            <BarChart3 className="w-6 h-6 mr-2 text-emerald-400" />
                            <h3 className="font-bold text-gray-100 text-xl">
                                Monthly Crime Trend {appliedFilters.year !== "All" && `(${appliedFilters.year})`}
                            </h3>
                        </div>
                        <div className="h-[calc(100%-40px)]">
                            <Bar
                                data={{
                                    labels: monthlyLabels,
                                    datasets: [
                                        {
                                            label: appliedFilters.crime_type !== "All" ? appliedFilters.crime_type : "Total Crimes",
                                            data: monthlyCounts,
                                            backgroundColor: "rgba(16, 185, 129, 0.7)", // Emerald
                                            borderColor: "#10B981",
                                            borderWidth: 1,
                                            borderRadius: 4,
                                        },
                                    ],
                                }}
                                options={darkChartOptions}
                            />
                        </div>
                    </div>

                    {/* 3️⃣ Yearly Crime Trend */}
                    <div className={cardClasses} style={{ height: 380 }}>
                        <div className="flex items-center mb-4">
                            <LineChart className="w-6 h-6 mr-2 text-blue-400" />
                            <h3 className="font-bold text-gray-100 text-xl">
                                Long-Term Yearly Trend
                            </h3>
                        </div>
                        <div className="h-[calc(100%-40px)]">
                            <Line
                                data={{
                                    labels: yearlyLabels,
                                    datasets: [
                                        {
                                            label: "Total Crimes per Year",
                                            data: yearlyTotals,
                                            fill: true,
                                            borderColor: "#3B82F6", // Blue
                                            backgroundColor: "rgba(59, 130, 246, 0.2)",
                                            tension: 0.4,
                                            pointRadius: 6,
                                            pointBackgroundColor: '#3B82F6',
                                            pointBorderColor: '#111827',
                                            pointHoverRadius: 8,
                                        },
                                    ],
                                }}
                                options={{
                                    ...darkChartOptions,
                                    plugins: { ...darkChartOptions.plugins, legend: { display: false } },
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StatisticsPage;