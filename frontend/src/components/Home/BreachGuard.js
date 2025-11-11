import React, { useState } from "react";
import axios from "axios";
import Navbar from "../Navbar";

const BreachGuard = () => {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState("default");

  const checkBreaches = async () => {
    if (!email) return alert("Please enter an email");

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.get(`http://localhost:5000/api/breachguard/hibp/${email}`);
      setResult(res.data);
    } catch (err) {
      console.error("Breach check failed:", err);
      setResult({ error: "Failed to check breaches" });
    } finally {
      setLoading(false);
    }
  };

  // 🔽 Sort function
  const getSortedBreaches = () => {
    if (!result || !result.success) return [];

    let breaches = [...result.breaches];

    switch (sortOption) {
      case "name-asc":
        return breaches.sort((a, b) => a.Name.localeCompare(b.Name));
      case "name-desc":
        return breaches.sort((a, b) => b.Name.localeCompare(a.Name));
      case "date-newest":
        return breaches.sort((a, b) => new Date(b.BreachDate) - new Date(a.BreachDate));
      case "date-oldest":
        return breaches.sort((a, b) => new Date(a.BreachDate) - new Date(b.BreachDate));
      case "type":
        return breaches.sort((a, b) => (a.DataClasses?.[0] || "").localeCompare(b.DataClasses?.[0] || ""));
      case "domain":
        return breaches.sort((a, b) => (a.Domain || "").localeCompare(b.Domain || ""));
      default:
        return breaches;
    }
  };

  const sortedBreaches = getSortedBreaches();

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "white" }}>
      <Navbar />

      <div style={{ textAlign: "center", paddingTop: "50px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700" }}>
          🔐 <span style={{ color: "#ff4ec7" }}>BreachGuard</span>
        </h1>
        <p style={{ color: "#aaa" }}>Check if your email has appeared in known data breaches</p>

        {/* Input & button */}
        <div style={{ marginTop: "20px" }}>
          <input
            type="email"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "10px 14px",
              width: "280px",
              borderRadius: "10px",
              border: "1px solid #333",
              background: "#111",
              color: "white",
              outline: "none",
            }}
          />
          <button
            onClick={checkBreaches}
            disabled={loading}
            style={{
              marginLeft: "10px",
              background: "#ff4ec7",
              border: "none",
              padding: "10px 16px",
              borderRadius: "10px",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {loading ? "Checking..." : "Check Breaches"}
          </button>
        </div>
      </div>

      {/* Results */}
      <div style={{ marginTop: "50px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "90%", maxWidth: "1200px" }}>
          {result && result.error && (
            <p style={{ color: "red", textAlign: "center" }}>{result.error}</p>
          )}

          {result && result.success && result.breaches.length === 0 && (
            <p style={{ textAlign: "center", color: "#aaa" }}>✅ No breaches found!</p>
          )}

          {result && result.success && result.breaches.length > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ color: "#ff4ec7" }}>Breaches Found</h2>

                {/* Sorting Dropdown */}
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  style={{
                    background: "#111",
                    color: "white",
                    border: "1px solid #333",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="default">Sort by...</option>
                  <option value="name-asc">Name (A → Z)</option>
                  <option value="name-desc">Name (Z → A)</option>
                  <option value="date-newest">Date (Newest)</option>
                  <option value="date-oldest">Date (Oldest)</option>
                  <option value="type">Type / Category</option>
                  <option value="domain">Domain Name</option>
                </select>
              </div>

              {/* Breach Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "20px",
                  marginTop: "20px",
                }}
              >
                {sortedBreaches.map((b, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#111",
                      padding: "20px",
                      borderRadius: "16px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.boxShadow = "0 0 15px #ff4ec7")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)")
                    }
                  >
                    <h3 style={{ color: "#fff", marginBottom: "8px" }}>{b.Name}</h3>
                    <p style={{ color: "#bbb", marginBottom: "10px" }}>
                      {b.Description || "No description available for this breach."}
                    </p>
                    {b.Domain && (
                      <p>
                        🌐 <span style={{ color: "#ff4ec7" }}>{b.Domain}</span>
                      </p>
                    )}
                    {b.BreachDate && (
                      <p>
                        📅 <span style={{ color: "#ff4ec7" }}>{b.BreachDate}</span>
                      </p>
                    )}
                    {b.DataClasses && (
                      <p style={{ color: "#aaa" }}>
                        🧾 Data Types:{" "}
                        <span style={{ color: "#ff4ec7" }}>{b.DataClasses.join(", ")}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreachGuard;
