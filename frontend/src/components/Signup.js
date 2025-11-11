// src/components/Signup.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../styles/theme.css";
import "../styles/Signup.css";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const { loginUser } = useUser(); // ✅ use context to set user

  // ✅ Password validation rules
  const validatePassword = (pwd) => {
    const minLength = /.{8,}/;
    const upper = /[A-Z]/;
    const lower = /[a-z]/;
    const number = /[0-9]/;
    const special = /[!@#$%^&*]/;

    if (!minLength.test(pwd)) return "Password must be at least 8 characters";
    if (!upper.test(pwd)) return "Password must include an uppercase letter";
    if (!lower.test(pwd)) return "Password must include a lowercase letter";
    if (!number.test(pwd)) return "Password must include a number";
    if (!special.test(pwd)) return "Password must include a special character";

    return "";
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    const error = validatePassword(value);
    setPasswordError(error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (passwordError) {
      alert("Please fix the password issues before signing up");
      return;
    }

    const username = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (!data.user) {
          alert("Signup failed: no user info returned from server.");
          return;
        }

        // ✅ Store user from backend response
        loginUser({
          username: data.user.username,
          email: data.user.email,
          verified: data.user.verified || false,
        });

        alert("Signup successful! Please verify your email.");
        localStorage.setItem("userEmail", data.user.email); // ✅ used by VerifyEmail.js
        navigate("/verify");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Something went wrong, please try again.");
    }
  };

  return (
    <div className="page-wrap">
      {/* Header */}
      <header className="site-header" style={{ background: "transparent", padding: "12px 28px" }}>
        <Link to="/" className="brand-wrap" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            className="site-logo"
            aria-hidden
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 18,
              color: "#fff",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.03)",
              boxShadow:
                "4px 4px 16px rgba(0,0,0,0.6), 10px 6px 30px rgba(255,50,120,0.065)",
            }}
          >
            V
          </div>
          <span className="brand-name" style={{ fontWeight: 700, fontSize: 18, color: "#fff" }}>
            Viblo
          </span>
        </Link>

        <nav className="site-nav" style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <Link to="/home" style={{ color: "rgba(255,255,255,0.62)" }}>Home</Link>
          <Link to="/signup" style={{ color: "#ff3a7a", fontWeight: 600 }}>Join</Link>
        </nav>
      </header>

      {/* Main split layout */}
      <div className="form-container">
        {/* Left Section: Signup Form */}
        <section className="form-section">
          <h1 className="hero-title">
            Create new account<span className="dot" style={{ marginLeft: 6 }}>.</span>
          </h1>
          <p className="sub">
            Already a member? <Link to="/login">Log in</Link>
          </p>

          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            {/* First + Last name row */}
            <div className="name-row" style={{ width: "100%" }}>
              <div className="half" style={{ display: "flex", flexDirection: "column" }}>
                <label className="field-label">First Name</label>
                <input
                  type="text"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="half" style={{ display: "flex", flexDirection: "column" }}>
                <label className="field-label">Last Name</label>
                <input
                  type="text"
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ width: "100%" }}>
              <label className="field-label">Email</label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ width: "100%" }}>
              <label className="field-label">Password</label>
              <input
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              {passwordError && <div className="error-text">{passwordError}</div>}
            </div>

            <div style={{ width: "100%" }}>
              <label className="field-label">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
              <button className="primary-btn" type="submit" disabled={!!passwordError}>
                Create account
              </button>
              <button type="button" className="secondary" style={{ width: "100%" }}>
                Change method
              </button>
            </div>
          </form>
        </section>

        {/* Right Section: Info */}
        <aside className="info-section" aria-hidden>
          <div>
            <h2>Where is my Email?</h2>
            <p>Track, verify, and manage all your accounts in one place.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Signup;
