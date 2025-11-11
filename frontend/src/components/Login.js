// src/components/Login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext"; // ✅ import context
import "../styles/theme.css";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { loginUser } = useUser(); // ✅ context updater

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (!data.user) {
          alert("Login failed: no user info returned from server.");
          return;
        }

        // ✅ Store user in context
        loginUser({
          username: data.user.username,
          email: data.user.email,
          verified: data.user.verified || false,
        });

        alert("Login successful!");
        navigate("/home");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong, please try again.");
    }
  };

  return (
    <div className="page-wrap">
      {/* ✅ Header with Logo & Navigation */}
      <header className="site-header">
        <div className="brand-wrap">
          <div className="site-logo">V</div>
          <span className="brand-name">Viblo</span>
        </div>
        <nav className="site-nav">
          <Link to="/home" className="nav-link">Home</Link>
          <Link to="/signup" className="nav-join">Signup</Link>
        </nav>
      </header>

      {/* ✅ Main Form Section */}
      <div className="form-container">
        {/* Left: Login Form */}
        <div className="form-section">
          <h1 className="hero-title">
            Welcome back<span className="dot">.</span>
          </h1>
          <p className="sub">
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </p>

          <form className="signup-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="primary-btn">Login</button>
          </form>
        </div>

        {/* Right: Info Section */}
        <div className="info-section">
          <div>
            <h2>Where is my Email?</h2>
            <p>Track, verify, and manage all your accounts in one place.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
