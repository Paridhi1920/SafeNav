import React from "react";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { TrendingUp, PieChart, MapPin, ShieldHalf } from 'lucide-react';

// ChartJS register
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

// --- Chart Theme Options for Dark Mode ---
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
            backgroundColor: 'rgba(31, 41, 55, 0.9)', // gray-800 semi-transparent
            titleColor: '#F9FAFB',
            bodyColor: '#D1D5DB',
            borderColor: '#374151',
            borderWidth: 1,
            cornerRadius: 8,
        }
    },
    scales: {
        x: {
            ticks: { color: '#9CA3AF' }, // gray-400
            grid: { color: 'rgba(55, 65, 81, 0.5)' }, // gray-700 semi-transparent
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
        legend: {
            position: 'bottom', 
            labels: {
                color: '#E5E7EB',
                font: { size: 14, family: "Inter" }
            }
        }
    }
};


const DashboardPage = () => {
    // Mock data adjusted for Critical Path branding colors (Red/Blue/Amber)
    const monthlyCrimeData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Crimes Reported",
                data: [40, 55, 35, 60, 48, 70],
                borderColor: "#3B82F6", // Blue for trend
                backgroundColor: "rgba(59, 130, 246, 0.15)", // Light blue fill
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#1F2937', 
                pointHoverRadius: 8,
            },
        ],
    };

    const areaWiseData = {
        labels: ["Vijay Nagar", "Palasia", "Rau", "Bhawarkuan", "Rajwada"],
        datasets: [
            {
                data: [120, 80, 40, 90, 110],
                // Tailwind based colors for dark theme contrast
                backgroundColor: ["#EF4444", "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6"], // Red, Blue, Amber, Emerald, Violet
                hoverOffset: 15,
                borderColor: '#111827', // Border matches the card background
                borderWidth: 3,
            },
        ],
    };

    const topDangerous = [
        { area: "Vijay Nagar", total: 120, trend: "up" },
        { area: "Rajwada", total: 110, trend: "up" },
        { area: "Bhawarkuan", total: 90, trend: "down" },
        { area: "Palasia", total: 80, trend: "down" },
        { area: "Rau", total: 40, trend: "neutral" },
    ];

    return (
        <>
            <script src="https://cdn.tailwindcss.com"></script>
            {/* Main Container - Dark Background, Font, Padding */}
            <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-10 font-['Inter']">
                
                {/* Header Section */}
                <header className="mb-12 text-center border-b border-gray-800 pb-6">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-red-500 flex items-center justify-center">
                        <ShieldHalf className="w-8 h-8 mr-3 text-blue-400" />
                        CRITICAL PATH Analytics 
                    </h1>
                    <p className="text-lg text-gray-400 mt-2 font-light max-w-2xl mx-auto">
                        Real-time visualization of urban risk and crime patterns.
                    </p>
                </header>

                {/* Charts Container - Responsive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    
                    {/* Line Chart Card */}
                    <div className="bg-gray-900 border border-blue-600/30 rounded-xl shadow-2xl shadow-blue-900/40 p-6 h-[480px]">
                        <div className="flex items-center mb-4">
                            <TrendingUp className="w-6 h-6 text-blue-400 mr-2" />
                            <h3 className="text-xl font-semibold text-gray-100">Crime Growth / Decline Trend (Past 6 Months)</h3>
                        </div>
                        <div className="h-[calc(100%-40px)]">
                            <Line data={monthlyCrimeData} options={darkChartOptions} />
                        </div>
                    </div>

                    {/* Pie Chart Card */}
                    <div className="bg-gray-900 border border-amber-600/30 rounded-xl shadow-2xl shadow-amber-900/40 p-6 h-[480px]">
                        <div className="flex items-center mb-4">
                            <PieChart className="w-6 h-6 text-amber-400 mr-2" />
                            <h3 className="text-xl font-semibold text-gray-100">Area-wise Crime Distribution (Total Incidents)</h3>
                        </div>
                        <div className="h-[calc(100%-40px)] flex justify-center items-center">
                             {/* Reduced height for pie chart to prevent overflow due to legend */}
                            <div className="w-full max-w-md h-[400px]">
                                <Pie data={areaWiseData} options={pieChartOptions} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Dangerous Areas Table */}
                <div className="bg-gray-900 border border-red-600/30 rounded-xl shadow-2xl shadow-red-900/40 p-6 max-w-4xl mx-auto">
                    <div className="flex items-center mb-6">
                        <MapPin className="w-6 h-6 text-red-400 mr-2" />
                        <h3 className="text-2xl font-semibold text-gray-100">Top Dangerous Hotspots</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-800">
                            <thead>
                                <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider bg-gray-800/50">
                                    <th className="px-6 py-3 rounded-tl-lg">Rank</th>
                                    <th className="px-6 py-3">Area Name</th>
                                    <th className="px-6 py-3">Total Incidents (6M)</th>
                                    <th className="px-6 py-3 rounded-tr-lg">Risk Trend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {topDangerous.map((a, i) => (
                                    <tr 
                                        key={i} 
                                        className={`hover:bg-gray-800 transition duration-150 ${i === 0 ? 'bg-red-900/10 border-l-4 border-red-500' : ''}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-300">
                                            {i + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                                            {a.area}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-red-400 font-bold">
                                            {a.total}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span 
                                                className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
                                                    a.trend === 'up' ? 'bg-red-600/20 text-red-400' :
                                                    a.trend === 'down' ? 'bg-emerald-600/20 text-emerald-400' :
                                                    'bg-gray-600/20 text-gray-400'
                                                }`}
                                            >
                                                {a.trend === 'up' && 'Increasing'}
                                                {a.trend === 'down' && 'Decreasing'}
                                                {a.trend === 'neutral' && 'Stable'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;