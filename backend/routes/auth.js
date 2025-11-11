const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const Password = require("../models/Password"); // ✅ new model for Fortify
const router = express.Router();

/**
 * ========================
 *   EMAIL TRANSPORTER
 * ========================
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ helper to format user safely
const formatUser = (user) => ({
  username: user.username,
  email: user.email,
  verified: user.isVerified,
});

/**
 * ========================
 *        SIGNUP
 * ========================
 */
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationCode,
      codeExpiry: Date.now() + 1 * 60 * 1000, // ✅ 1 minute expiry
    });

    await newUser.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your email",
      text: `Your verification code is: ${verificationCode}`,
    });

    console.log(`Verification code sent to ${email}: ${verificationCode}`);

    res.status(201).json({
      message: "User created successfully. Check your email for the verification code.",
      user: formatUser(newUser),
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
});

/**
 * ========================
 *     VERIFY EMAIL
 * ========================
 */
router.post("/verify-email", async (req, res) => {
  const { email, code } = req.body;

  console.log("Verification attempt:", { email, code });

  try {
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    if (code.length !== 6) {
      return res.status(400).json({ message: "Code must be 6 digits" });
    }

    const user = await User.findOne({ email }).select("+verificationCode +codeExpiry");
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      console.log("User already verified:", email);
      return res.status(400).json({ message: "User already verified" });
    }

    console.log("Expected code:", user.verificationCode, "Received code:", code);

    if (String(user.verificationCode).trim() !== String(code).trim()) {
      console.log("Code mismatch for user:", email);
      return res.status(400).json({ message: "Invalid verification code" });
    }

    console.log("Code expiry:", new Date(user.codeExpiry), "Current time:", new Date());

    if (user.codeExpiry < Date.now()) {
      console.log("Code expired for user:", email);
      return res
        .status(400)
        .json({ message: "Verification code expired. Please request a new code." });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.codeExpiry = null;
    await user.save();

    console.log("Email verified successfully for:", email);

    res.json({
      message: "Email verified successfully!",
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
});

/**
 * ========================
 *   RESEND VERIFICATION
 * ========================
 */
router.post("/resend-code", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for resend:", email);
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newCode;
    user.codeExpiry = Date.now() + 1 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Resend Verification Code",
      text: `Your new verification code is: ${newCode}`,
    });

    console.log(`New verification code sent to ${email}: ${newCode}`);

    res.json({ message: "A new verification code has been sent to your email." });
  } catch (error) {
    console.error("Resend error:", error);
    res.status(500).json({ message: "Resend failed", error: error.message });
  }
});

/**
 * ========================
 *        LOGIN
 * ========================
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email before logging in" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("Login successful for:", email);

    res.json({
      message: "Login successful",
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

/**
 * ========================
 *   FORTIFY - SAVE PASSWORD
 * ========================
 */
router.post("/save-password", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const saved = new Password({
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    await saved.save();

    console.log(`Password saved for user: ${email}`);
    res.json({ message: "Password saved successfully!" });
  } catch (error) {
    console.error("Save password error:", error);
    res.status(500).json({ message: "Failed to save password", error: error.message });
  }
});

module.exports = router;
