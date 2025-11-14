import React, { useState } from "react";
import { MapPin, ShieldHalf, Search, AlertTriangle, XCircle, TrendingUp, PieChart } from 'lucide-react';
import { getAreaInfo } from '../services/hotspotApi';

// Helper function to calculate risk level and color from safety score
const calculateRiskLevel = (safetyScore) => {
    if (typeof safetyScore === 'string' && safetyScore === 'N/A') {
        return { riskLevel: 'UNKNOWN', riskColor: 'text-gray-400' };
    }
    
    const score = typeof safetyScore === 'number' ? safetyScore : parseInt(safetyScore);
    
    if (score < 65) {
        return { riskLevel: 'HIGH', riskColor: 'text-red-400' };
    } else if (score < 75) {
        return { riskLevel: 'MODERATE', riskColor: 'text-amber-400' };
    } else {
        return { riskLevel: 'LOW', riskColor: 'text-emerald-400' };
    }
};

// Helper function to generate AI note from data
const generateAINote = (topCrimes, safetyScore, totalCrimes) => {
    if (!topCrimes || Object.keys(topCrimes).length === 0) {
        return "No significant crime data available for this area.";
    }
    
    const primaryCrime = Object.keys(topCrimes)[0];
    const primaryCount = topCrimes[primaryCrime];
    
    // Convert safetyScore to number if it's a string
    const score = typeof safetyScore === 'string' && safetyScore === 'N/A' 
        ? 50 
        : (typeof safetyScore === 'number' ? safetyScore : parseInt(safetyScore));
    
    let timeAdvice = "Exercise normal caution throughout the day.";
    if (score < 65) {
        timeAdvice = "Heightened caution is recommended, especially after 8 PM.";
    } else if (score < 75) {
        timeAdvice = "Moderate caution is advised, particularly during evening hours.";
    }
    
    return `Predictive analysis indicates ${primaryCrime} is the primary risk factor (${primaryCount} incidents). ${timeAdvice} Total reported incidents: ${totalCrimes || 'N/A'}.`;
};

const CrimeHotspotPage = () => {
    const [area, setArea] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCheck = async () => {
        setError(null);
        setResult(null);

        if (!area.trim()) {
            setError("Please enter a valid area name to initiate the safety check.");
            return;
        }

        setLoading(true);
        try {
            // Call backend API
            const res = await getAreaInfo(area);
            
            // Transform backend response to match frontend expectations
            const { riskLevel, riskColor } = calculateRiskLevel(res.safety_score);
            const aiNote = generateAINote(res.top_3_crimes, res.safety_score, res.total_crimes);
            
            setResult({
                area1: res.area ? res.area.toUpperCase() : area.toUpperCase(),
                safety_score: res.safety_score,
                risk_level: riskLevel,
                risk_color: riskColor,
                top_3_crimes: res.top_3_crimes || {},
                all_crimes: res.all_crimes || res.top_3_crimes || {},  // Use all_crimes if available, fallback to top_3_crimes
                pie_chart: res.pie_chart,
                bar_chart: res.bar_chart,
                ai_note: aiNote,
            });
        } catch (err) {
            console.error("Error fetching area info:", err);
            setError(err.response?.data?.error || "Failed to fetch data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Determine card accent color based on risk level
    const getAccentColor = (risk) => {
        switch (risk) {
            case 'HIGH':
                return { border: 'border-red-600/50', shadow: 'shadow-red-800/40', text: 'text-red-400' };
            case 'MODERATE':
                return { border: 'border-amber-600/50', shadow: 'shadow-amber-800/40', text: 'text-amber-400' };
            case 'LOW':
                return { border: 'border-emerald-600/50', shadow: 'shadow-emerald-800/40', text: 'text-emerald-400' };
            case 'UNKNOWN':
                return { border: 'border-gray-600/50', shadow: 'shadow-gray-800/40', text: 'text-gray-400' };
            default:
                return { border: 'border-blue-600/50', shadow: 'shadow-blue-800/40', text: 'text-blue-400' };
        }
    };
    
    const colors = result ? getAccentColor(result.risk_level) : { border: 'border-blue-600/50', shadow: 'shadow-blue-800/40', text: 'text-blue-400' };


    return (
        <>
            <script src="https://cdn.tailwindcss.com"></script>
            <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-10 font-['Inter'] flex flex-col items-center">
                
                {/* Header */}
                <header className="mb-10 text-center w-full max-w-xl">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-blue-400 flex items-center justify-center">
                        <MapPin className="w-8 h-8 mr-3 text-red-500" />
                        Area Risk Assessment
                    </h1>
                    <p className="text-lg text-gray-400 mt-2 font-light">
                        Query any location for instant, AI-driven safety metrics and crime analysis.
                    </p>
                </header>

                {/* Input & Button Section */}
                <div className="w-full max-w-lg mb-8 p-6 bg-gray-900 border border-gray-800 rounded-xl shadow-xl shadow-black/50">
                    
                    <div className="flex space-x-4 items-center">
                        <input
                            type="text"
                            placeholder="Enter Area Name (e.g., Vijay Nagar)"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            disabled={loading}
                            className="flex-grow p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                        />
                        <button 
                            onClick={handleCheck}
                            disabled={loading}
                            className={`px-6 py-3 font-bold rounded-lg text-white transition duration-300 transform shadow-lg flex items-center justify-center ${
                                loading 
                                ? 'bg-gray-600 cursor-not-allowed' 
                                : 'bg-red-600 hover:bg-red-700 shadow-red-500/50 hover:scale-[1.03] ring-2 ring-red-500/20'
                            }`}
                        >
                            {loading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <Search className="w-5 h-5 mr-2" />
                            )}
                            {loading ? 'Analyzing...' : 'Check Safety'}
                        </button>
                    </div>

                    {/* Error Notification */}
                    {error && (
                        <div className="mt-4 p-4 flex items-center bg-red-900/30 border border-red-500/50 rounded-lg text-red-300">
                            <XCircle className="w-5 h-5 mr-3" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Result Card */}
                {result && (
                    <div 
                        className={`w-full max-w-4xl p-8 bg-gray-900 rounded-xl shadow-2xl transition-all duration-500 
                            ${colors.border} ${colors.shadow} border-t border-l border-b-2 border-r-2`}
                    >
                        <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
                            <h3 className="text-3xl font-bold text-gray-50 flex items-center">
                                <MapPin className={`w-6 h-6 mr-3 ${colors.text}`} />
                                {result.area1}
                            </h3>
                            <span className={`text-xl font-extrabold px-4 py-1 rounded-full ${colors.text} bg-gray-800/50 border ${colors.border}`}>
                                {result.risk_level} Risk
                            </span>
                        </div>

                        {/* Safety Score & Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            
                            {/* Score Card */}
                            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700/50 text-center shadow-inner">
                                <p className="text-sm text-gray-400">Safety Score</p>
                                <p className={`text-5xl font-extrabold mt-1 ${colors.text}`}>
                                    {result.safety_score}
                                </p>
                                <p className="text-xs text-gray-500">out of 100</p>
                            </div>

                            {/* Crime List */}
                            <div className="md:col-span-2 p-4 bg-gray-800 rounded-lg border border-gray-700/50 shadow-inner">
                                <h4 className="text-lg font-semibold text-gray-200 mb-3 flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-2 text-red-400" /> 
                                    {result.all_crimes && Object.keys(result.all_crimes).length > 0 
                                        ? `All Incident Types (${Object.keys(result.all_crimes).length})` 
                                        : "Top 3 Incident Types"}
                                </h4>
                                <ul className="space-y-2 max-h-64 overflow-y-auto">
                                    {Object.entries(result.all_crimes || result.top_3_crimes || {}).map(([crime, count], index) => (
                                        <li key={crime} className="flex justify-between text-sm text-gray-300 border-b border-gray-700/50 last:border-b-0 pb-1">
                                            <span className="font-medium text-gray-400">{crime}</span>
                                            <span className="font-bold text-red-300">{count} reports</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>


                        {/* Chart and AI Note Section */}
                        <div className="space-y-6">
                            <h4 className="text-xl font-bold text-gray-200 border-b border-gray-800 pb-2">Predictive Visualization</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Pie Chart */}
                                <div className="bg-gray-800 p-4 rounded-lg border border-blue-500/30">
                                    <h5 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                                        <PieChart className="w-4 h-4 mr-2 text-blue-400" />
                                        Crime Type Distribution
                                    </h5>
                                    {result.pie_chart ? (
                                        <div className="flex items-center justify-center min-h-[200px]">
                                            <img 
                                                src={`data:image/png;base64,${result.pie_chart}`} 
                                                alt="Pie Chart" 
                                                className="max-w-full h-auto"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    const errorDiv = e.target.parentElement.querySelector('.chart-error');
                                                    if (errorDiv) errorDiv.classList.remove('hidden');
                                                }}
                                            />
                                            <div className="hidden chart-error flex-col items-center justify-center h-48 text-gray-500">
                                                <PieChart className="w-12 h-12 opacity-50" />
                                                <p className="mt-2 text-sm">Chart failed to load</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                                            <PieChart className="w-12 h-12 opacity-50" />
                                            <p className="mt-2 text-sm">No chart data available</p>
                                        </div>
                                    )}
                                </div>
                                {/* Bar Chart */}
                                <div className="bg-gray-800 p-4 rounded-lg border border-amber-500/30">
                                    <h5 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                                        <ShieldHalf className="w-4 h-4 mr-2 text-amber-400" />
                                        Crime Count by Type
                                    </h5>
                                    {result.bar_chart ? (
                                        <div className="flex items-center justify-center min-h-[200px]">
                                            <img 
                                                src={`data:image/png;base64,${result.bar_chart}`} 
                                                alt="Bar Chart" 
                                                className="max-w-full h-auto "
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    const errorDiv = e.target.parentElement.querySelector('.chart-error');
                                                    if (errorDiv) errorDiv.classList.remove('hidden');
                                                }}
                                            />
                                            <div className="hidden chart-error flex-col items-center justify-center h-48 text-gray-500">
                                                <ShieldHalf className="w-12 h-12 opacity-50" />
                                                <p className="mt-2 text-sm">Chart failed to load</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                                            <ShieldHalf className="w-12 h-12 opacity-50" />
                                            <p className="mt-2 text-sm">No chart data available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* AI Note */}
                            {result.ai_note && (
                                <div className={`p-4 mt-6 bg-blue-900/20 border border-blue-600/50 rounded-lg shadow-md`}>
                                    <p className="text-sm text-blue-300 font-medium leading-relaxed">
                                        <span className="font-bold text-blue-200 mr-2">AI Summary:</span> {result.ai_note}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CrimeHotspotPage;