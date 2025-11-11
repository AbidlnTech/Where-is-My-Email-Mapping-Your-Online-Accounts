import React from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Navbar that matches your app design:
 * - Left: rounded logo "V" and "Viblo"
 * - Right: nav items (Home, Fortify, BreachGuard, Account)
 * - Active item: pink color + pink underline bar
 * - Dark background, spacing similar to your screenshots
 */

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/home" },
    { name: "Fortify", path: "/fortify" },
    { name: "BreachGuard", path: "/breachguard" },
    { name: "Account", path: "/account" },
  ];

  const pink = "#ff4ec7";

  return (
    <header
      style={{
        width: "100%",
        backgroundColor: "#070707",
        padding: "18px 48px",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
      }}
    >
      {/* Left: Logo + name */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background:
              "linear-gradient(180deg, rgba(255,78,199,0.06), rgba(255,78,199,0.02))",
            boxShadow: "0 6px 28px rgba(255,78,199,0.06), inset 0 1px 0 rgba(255,255,255,0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 700,
            fontSize: 18,
            fontFamily: "Poppins, sans-serif",
            border: "1px solid rgba(255,78,199,0.06)"
          }}
        >
          V
        </div>

        <div style={{ color: "#fff", fontWeight: 600, fontFamily: "Poppins, sans-serif" }}>
          Viblo
        </div>
      </div>

      {/* Right: Nav items */}
      <nav>
        <ul
          style={{
            display: "flex",
            gap: 42,
            listStyle: "none",
            margin: 0,
            padding: 0,
            alignItems: "center",
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} style={{ position: "relative" }}>
                <Link
                  to={item.path}
                  style={{
                    color: isActive ? pink : "#bfbfbf",
                    textDecoration: "none",
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 16,
                    transition: "color 150ms ease",
                    paddingBottom: 6,
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  {item.name}
                </Link>

                {/* active underline */}
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      left: "0",
                      right: "0",
                      bottom: -8,
                      height: 3,
                      background: pink,
                      borderRadius: 3,
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
