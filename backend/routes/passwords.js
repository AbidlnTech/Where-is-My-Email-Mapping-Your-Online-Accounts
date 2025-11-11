const express = require("express");
const router = express.Router();
const Password = require("../models/Password");

// Save a generated password
router.post("/save", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const newPassword = new Password({ email, password });
    await newPassword.save();

    res.status(201).json({
      message: "Password saved successfully",
      data: newPassword,
    });
  } catch (err) {
    console.error("Save password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all passwords for a specific user
router.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const passwords = await Password.find({ email }).sort({ createdAt: -1 });
    res.status(200).json(passwords);
  } catch (err) {
    console.error("Fetch passwords error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete a password by ID
router.delete("/:id", async (req, res) => {
  try {
    const result = await Password.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Password not found" });
    }
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
