// src/components/VerifyEmail.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext"; // ✅ import context
import "../styles/theme.css";
import "../styles/VerifyEmail.css";

const VerifyEmail = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]); // 6-digit OTP
  const [timer, setTimer] = useState(60); // ⏳ 1 minute (60 seconds)
  const [email, setEmail] = useState(""); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useUser(); // ✅ to update user context after verification

  // ✅ Load email stored during signup
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email found, redirect to signup
      alert("No email found. Please sign up first.");
      navigate("/signup");
    }
  }, [navigate]);

  // ✅ Countdown Timer
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  // ✅ Handle input changes (auto-focus next)
  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        document.getElementById(`code-${index + 1}`).focus();
      }
    }
  };

  // ✅ Handle backspace (focus previous input)
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
  };

  // ✅ Submit verification
  const handleVerify = async (e) => {
    e.preventDefault();
    
    const enteredCode = code.join("");
    
    // ✅ Validation
    if (enteredCode.length !== 6) {
      alert("Please enter all 6 digits");
      return;
    }
    
    if (!email) {
      alert("Email not found. Please go back to signup.");
      return;
    }

    setLoading(true);

    try {
      console.log("Submitting verification:", { email, code: enteredCode });

      const res = await fetch("http://localhost:5000/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: enteredCode }),
      });

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (res.ok && data.user) {
        // ✅ Update context with verified user
        loginUser({
          username: data.user.username,
          email: data.user.email,
          verified: data.user.verified || true,
        });

        alert("Email verified successfully!");
        localStorage.removeItem("userEmail"); // cleanup
        navigate("/home"); // go straight to home after verification
      } else {
        // Handle specific error messages
        if (data.message === "Verification code expired. Please request a new code.") {
          alert("Your verification code has expired. A new code will be sent.");
          handleResend();
        } else {
          alert(data.message || "Invalid verification code");
        }
      }
    } catch (err) {
      console.error("Verification error:", err);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Resend code
  const handleResend = async () => {
    if (!email) {
      alert("Email not found. Please go back to signup.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("A new code has been sent to your email!");
        setTimer(60); // reset timer to 1 minute
        setCode(["", "", "", "", "", ""]); // clear input
        // Focus first input
        document.getElementById("code-0").focus();
      } else {
        alert(data.message || "Failed to resend code");
      }
    } catch (err) {
      console.error("Resend error:", err);
      alert("Something went wrong while resending code");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Format timer as mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  return (
    <div className="page-wrap">
      {/* Header */}
      <header className="site-header">
        <div className="brand-wrap">
          <div className="site-logo">V</div>
          <span className="brand-name">Viblo</span>
        </div>
        <nav className="site-nav">
          <Link to="/home" className="nav-link">Home</Link>
          <Link to="/login" className="nav-join">Login</Link>
        </nav>
      </header>

      {/* Main Section */}
      <div className="form-container">
        {/* Left: Verification Form */}
        <div className="form-section">
          <h1 className="hero-title">
            Verify your email<span className="dot">.</span>
          </h1>
          <p className="sub">Enter the 6-digit code sent to <b>{email}</b>.</p>

          <form className="signup-form" onSubmit={handleVerify}>
            {/* OTP Inputs */}
            <div className="digit-inputs">
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  disabled={loading}
                  style={{
                    textAlign: "center",
                    fontSize: "1.2rem",
                    padding: "10px",
                    margin: "0 5px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    width: "40px",
                  }}
                />
              ))}
            </div>

            {/* Timer */}
            <p className="sub">
              Code will expire in{" "}
              <strong className="verify-timer" style={{ color: timer < 60 ? "red" : "inherit" }}>
                {formatTime(timer)}
              </strong>
            </p>

            {/* Verify Button */}
            <button 
              type="submit" 
              className="primary-btn"
              disabled={loading || timer <= 0}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>

            {/* Extra Options */}
            <div className="verify-actions">
              <button
                type="button"
                className="link-btn"
                onClick={handleResend}
                disabled={loading}
                style={{
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Sending..." : "Resend Code"}
              </button>
              <Link to="/signup" className="link-btn">
                Change Email
              </Link>
            </div>
          </form>
        </div>

        {/* Right Info Section */}
        <div className="info-section">
          <div>
            <h2>Email Verification</h2>
            <p>Enter the verification code we sent to your inbox.</p>
            <p><small>Didn't receive the code? Check your spam folder or click "Resend Code".</small></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;