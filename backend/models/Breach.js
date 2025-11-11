// backend/models/Breach.js
const mongoose = require("mongoose");

const BreachSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  breachName: { type: String, required: true },
  title: String,
  domain: String,
  breachDate: Date,
  addedDate: { type: Date, default: Date.now },
  details: mongoose.Schema.Types.Mixed, // store extra info if needed
  verified: { type: Boolean, default: true },
});

module.exports = mongoose.model("Breach", BreachSchema);
