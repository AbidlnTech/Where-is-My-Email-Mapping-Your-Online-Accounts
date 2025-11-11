import React, { useState } from "react";
import Header from "../Header";
import "../../styles/theme.css";
import "../../styles/Account.css"
import { useUser } from "../../context/UserContext"; // ✅ import context
import { useNavigate } from "react-router-dom"; // ✅ for redirect

const Account = () => {
  const { user, loginUser, logoutUser } = useUser(); // ✅ include logoutUser
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user || {});
  const navigate = useNavigate();

  const handleEditClick = () => {
    setFormData(user); // preload with current user info
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    loginUser(formData); // ✅ update user in global context
    setIsEditing(false);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      logoutUser(); // ✅ clear user from context + localStorage
      navigate("/login"); // redirect to login page
    }
  };

  // ✅ Fallback when no user is logged in
  if (!user) {
    return (
      <>
        <Header />
        <div className="account-container">
          <div className="account-card">
            <h2 className="account-title">No Profile Data</h2>
            <p>Please sign up or log in to view your account.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="account-container">
        <div className="account-card">
          <div className="account-header">
            <h2 className="account-title">Profile Info</h2>
            <button className="edit-btn" onClick={handleEditClick}>
              Edit
            </button>
          </div>
          <div className="account-details">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p>
              <strong>Status:</strong>{" "}
              {user.verified ? (
                <span className="verified">Verified</span>
              ) : (
                <span className="not-verified">Not Verified</span>
              )}
            </p>

            {/* ✅ Logout button below profile info */}
            <button
              onClick={handleLogout}
              className="logout-btn"
              style={{
                marginTop: "20px",
                backgroundColor: "#ff4d4d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                cursor: "pointer",
                fontWeight: "600",
                width: "100%",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Modal for Editing */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Profile</h3>
            <label>
              Username
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </label>

            <div className="modal-actions">
              <button className="secondary-btn" onClick={handleClose}>
                Cancel
              </button>
              <button className="primary-btn" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Account;
