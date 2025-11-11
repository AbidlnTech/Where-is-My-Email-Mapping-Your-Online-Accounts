import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./context/UserContext"; // ✅ import context

// Auth pages
import Signup from "./components/Signup";
import Login from "./components/Login";
import VerifyEmail from "./components/VerifyEmail";

// App pages
import Home from "./components/Home/Home";
import Fortify from "./components/Home/Fortify";
import BreachGuard from "./components/Home/BreachGuard";
import Account from "./components/Home/Account";

function App() {
  const { user } = useUser(); // ✅ access user from context

  // ✅ Reusable protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!user || !user.email) {
      alert("Please sign up or log in to access this page!");
      return <Navigate to="/signup" replace />;
    }
    return children;
  };

  return (
    <Routes>
      {/* ✅ Default route now goes to home */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Auth routes (public) */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify" element={<VerifyEmail />} />

      {/* Public page */}
      <Route path="/home" element={<Home />} />

      {/* ✅ Protected pages */}
      <Route
        path="/fortify"
        element={
          <ProtectedRoute>
            <Fortify />
          </ProtectedRoute>
        }
      />

      <Route
        path="/breachguard"
        element={
          <ProtectedRoute>
            <BreachGuard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
