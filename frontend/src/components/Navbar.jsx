import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">🚨 SafeNav</div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/hotspots">Hotspots</Link></li>
        <li><Link to="/safe-route">Safe Route</Link></li>
        <li><Link to="/statistics">Statistics</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;