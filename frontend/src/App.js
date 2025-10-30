import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import RouteFinder from "./components/RouteFinder";
import HotspotList from "./components/HotspotList";
import StatisticsPage from "./pages/StatisticsPage"; 
import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<h1 style={{ padding: "20px" }}>🏠 Welcome to SafeNav</h1>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hotspots" element={<HotspotList />} />
          <Route path="/safe-route" element={<RouteFinder />} />
          <Route path="/statistics" element={<StatisticsPage />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
