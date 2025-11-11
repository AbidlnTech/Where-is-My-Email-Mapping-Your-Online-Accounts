// src/context/UserContext.js
import React, { createContext, useState, useContext, useEffect } from "react";

// 1️⃣ Create Context
const UserContext = createContext();

// 2️⃣ Provider component
export const UserProvider = ({ children }) => {
  // ✅ Load user from localStorage if available
  const storedUser = JSON.parse(localStorage.getItem("user")) || {
    username: "",
    email: "",
    verified: false,
  };

  const [user, setUser] = useState(storedUser);

  // ✅ Save to localStorage whenever user changes
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  // Function to update user info (called after signup/login)
  const loginUser = (userData) => {
    setUser({
      username: userData.username,
      email: userData.email,
      verified: userData.verified || false,
    });
  };

  // Function to logout
  const logoutUser = () => {
    setUser({ username: "", email: "", verified: false });
    localStorage.removeItem("user"); // ✅ clear storage
  };

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

// 3️⃣ Hook for easy usage
export const useUser = () => useContext(UserContext);
