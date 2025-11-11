// src/components/Home/Fortify.js
import React, { useState, useEffect, useCallback } from "react";
import Header from "../Header";
import { useUser } from "../../context/UserContext";
import "../../styles/theme.css";
import "../../styles/Fortify.css";

// === Helper: SHA-1 Hex for HIBP ===
async function sha1Hex(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await window.crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

// === Check exposure from Have I Been Pwned ===
async function checkExposure(password) {
  try {
    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!res.ok) throw new Error("Failed to reach HIBP");
    const text = await res.text();

    const lines = text.split("\n");
    for (let line of lines) {
      const [hashSuffix, count] = line.trim().split(":");
      if (hashSuffix.toUpperCase() === suffix.toUpperCase()) {
        return parseInt(count, 10) || 0;
      }
    }
    return 0;
  } catch (err) {
    console.error("Exposure check failed:", err);
    return -1; // error case
  }
}

const Fortify = () => {
  const { user } = useUser();

  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const [exposure, setExposure] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showCopied, setShowCopied] = useState(false);
  const [savedPasswords, setSavedPasswords] = useState([]);

  // === Calculate Strength ===
  useEffect(() => {
    if (!password) {
      setStrength(0);
      setExposure(null);
      return;
    }

    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    setStrength(score);

    const delay = setTimeout(async () => {
      const count = await checkExposure(password);
      setExposure(count);
    }, 800);

    return () => clearTimeout(delay);
  }, [password]);

  // === Generate Stronger Passwords ===
  const generateSuggestions = useCallback(() => {
    if (!password) return alert("Enter a password first!");

    const base = password.replace(/[^A-Za-z0-9]/g, "");
    const words = ["Nova", "Byte", "Pulse", "Flux", "Echo", "Cipher", "Blaze"];
    const specials = "!@#$%^&*?";
    const list = Array.from({ length: 5 }, () => {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const special = specials[Math.floor(Math.random() * specials.length)];
      return `${base.slice(0, 3)}${randomWord}${randomNum}${special}`;
    });
    setSuggestions(list);
  }, [password]);

  // === Copy + Save Password ===
  const handleCopyAndSave = async (pwd) => {
    try {
      await navigator.clipboard.writeText(pwd);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 1500);

      const res = await fetch("http://localhost:5000/api/passwords/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, password: pwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      console.log("✅ Saved:", data);
      fetchSavedPasswords();
    } catch (err) {
      console.error("❌ Error saving:", err);
    }
  };

  // === Fetch saved passwords ===
  const fetchSavedPasswords = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/passwords/user/${user.email}`
      );
      const data = await res.json();
      if (res.ok) setSavedPasswords(data);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  };

  // === Delete password ===
  const handleDelete = async (id, index) => {
    if (!window.confirm("Are you sure you want to delete this password?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/passwords/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const item = document.querySelectorAll(".saved-item")[index];
        if (item) {
          item.classList.add("fade-out");
          setTimeout(() => {
            setSavedPasswords((prev) => prev.filter((pw) => pw._id !== id));
          }, 300);
        } else {
          setSavedPasswords((prev) => prev.filter((pw) => pw._id !== id));
        }
      } else {
        console.error("Delete failed:", await res.text());
      }
    } catch (err) {
      console.error("Error deleting password:", err);
    }
  };

  return (
    <>
      <Header />
      <div className="fortify-container">
        <h1 className="title neon">⚡ Fortify — Smart Password Guardian</h1>
        <p className="subtitle">Test your password, strengthen it, and keep it safe.</p>

        {/* === Password Input === */}
        <div className="input-section">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="🔍 Type your password..."
            className="input-field glow-input"
          />
          <button className="primary-btn" onClick={generateSuggestions}>
            Suggest Stronger Passwords
          </button>
        </div>

        {/* === Strength Meter === */}
        {password && (
          <div className="strength-meter">
            <svg viewBox="0 0 200 100" width="100%" height="100%">
              <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#333" strokeWidth="10" />
              <path
                d="M20 100 A80 80 0 0 1 180 100"
                fill="none"
                stroke={strength < 40 ? "red" : strength < 70 ? "orange" : "lime"}
                strokeWidth="10"
                strokeDasharray={`${(strength / 100) * 250}, 250`}
              />
              <text x="100" y="120" textAnchor="middle" fontSize="18" fill="#fff">
                {strength}% Strength
              </text>
            </svg>
          </div>
        )}

        {/* === Password Exposure === */}
        {exposure !== null && (
          <div className="exposure-box">
            {exposure === -1 ? (
              <p className="warn">⚠️ Could not check exposure. Try again.</p>
            ) : exposure === 0 ? (
              <p className="safe">✅ Not found in known breaches.</p>
            ) : (
              <p className="danger">
                ⚠️ Found in <strong>{exposure}</strong> breaches! Avoid using this password.
              </p>
            )}
          </div>
        )}

        {/* === Suggestions === */}
        {suggestions.length > 0 && (
          <div className="suggestions-section">
            <h2>💡 Stronger Suggestions</h2>
            <div className="suggestion-list">
              {suggestions.map((s, i) => (
                <SuggestionCard key={i} password={s} onSave={handleCopyAndSave} />
              ))}
            </div>
          </div>
        )}

        {/* === Saved Passwords === */}
        <div className="saved-section">
          <h2>🗂️ Saved Passwords</h2>
          <button className="secondary-btn" onClick={fetchSavedPasswords}>
            Refresh
          </button>
          {savedPasswords.length > 0 ? (
            <div className="saved-list">
              {savedPasswords.map((p, i) => (
                <div key={p._id || i} className="saved-item">
                  <div className="saved-left">
                    <span className="saved-password">{p.password}</span>
                    <span className="timestamp">
                      {new Date(p.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="saved-actions">
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(p._id, i)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No saved passwords yet.</p>
          )}
        </div>

        {showCopied && <p className="copied-msg">✅ Copied & Saved!</p>}
      </div>
    </>
  );
};

// === Suggestion Card Component ===
const SuggestionCard = ({ password, onSave }) => {
  const [exposure, setExposure] = useState(null);

  useEffect(() => {
    const fetchExposure = async () => {
      const count = await checkExposure(password);
      setExposure(count);
    };
    fetchExposure();
  }, [password]);

  return (
    <div className="suggestion-item">
      <div className="pw-box">
        <span>{password}</span>
      </div>
      {exposure !== null && (
        <p className={exposure === 0 ? "safe small" : "danger small"}>
          {exposure === 0
            ? "✅ Safe — not found"
            : `⚠️ Found in ${exposure} breaches`}
        </p>
      )}
      <button className="copy-btn" onClick={() => onSave(password)}>
        💾 Save
      </button>
    </div>
  );
};

export default Fortify;
