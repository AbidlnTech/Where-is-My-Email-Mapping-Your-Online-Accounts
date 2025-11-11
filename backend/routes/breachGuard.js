const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();
const router = express.Router();

// ✅ Route: Check if an email has been in a breach using Have I Been Pwned API
router.get("/hibp/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const response = await axios.get(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`, {
      headers: {
        "hibp-api-key": process.env.HIBP_API_KEY,
        "user-agent": "VibloSecurityApp", // Required by HIBP
      },
    });

    res.json({
      success: true,
      breaches: response.data,
    });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // 404 = no breach found for that email
      res.json({ success: true, breaches: [] });
    } else {
      console.error("🔴 BreachGuard HIBP error:", error.message);
      res.status(500).json({ error: "Failed to check breaches" });
    }
  }
});

module.exports = router;
