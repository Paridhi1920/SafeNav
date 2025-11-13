import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import CrimeHotspotPage from "./pages/CrimeHotspotPage";
import SafeRoutePage from "./pages/SafeRoutePage";
import StatisticsPage from "./pages/StatisticsPage";
import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/hotspots" element={<CrimeHotspotPage />} />
          <Route path="/safe-route" element={<SafeRoutePage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
