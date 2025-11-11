const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ Import Routes
const authRoutes = require('./routes/auth');
const passwordRoutes = require('./routes/passwords');
const breachGuardRouter = require('./routes/breachGuard'); // ⬅️ Added here

// ✅ Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/passwords', passwordRoutes);
app.use('/api/breachguard', breachGuardRouter); // ⬅️ Added here

// ✅ Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
