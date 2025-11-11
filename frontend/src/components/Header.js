import React from "react";
import { NavLink } from "react-router-dom"; // ✅ Use NavLink for active highlighting
import "../styles/theme.css";
import "../styles/Header.css";

const Header = () => {
  return (
    <header className="site-header">
      {/* ✅ Logo */}
      <div className="brand-wrap">
        <div className="site-logo">V</div>
        <span className="brand-name">Viblo</span>
      </div>

      {/* ✅ Navigation */}
      <nav className="site-nav">
        <NavLink to="/home" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Home
        </NavLink>
        <NavLink to="/fortify" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Fortify
        </NavLink>
        <NavLink to="/breachguard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          BreachGuard
        </NavLink>
        <NavLink to="/account" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Account
        </NavLink>
      </nav>
    </header>
  );
};

export default Header;
