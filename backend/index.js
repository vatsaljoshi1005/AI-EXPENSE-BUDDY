const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
// const { getSpendingByMonth } = require('./controllers/getspendingControl');
// const { authMiddleware } = require('./middleware/authMiddleware'); 
const app = express();
app.use(express.json());
app.use(cors());
require('./cronjobs'); // <-- runs in background
// router.post("/ai/spending", authMiddleware, getSpendingByMonth);
// app.post("/api/spending", authMiddleware, getSpendingByMonth);
const aiRoutes = require("./routes/ai");
app.use("/api/ai", aiRoutes);
const authRoutes = require('./routes/auth');
const transactionRoutes = require("./routes/transaction");
app.use("/api/transactions", transactionRoutes);
app.use('/api/auth', authRoutes);
const analyticsRoutes = require("./routes/analytics");
app.use("/api/analytics", analyticsRoutes);
const profileRoutes = require("./routes/profile");
app.use("/api/profile", profileRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));