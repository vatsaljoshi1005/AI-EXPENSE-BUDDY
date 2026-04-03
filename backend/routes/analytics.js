const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getMonthlyHistory,
    getMonthlySummary,
    getCategoryBreakdown,
    getFinancialScore,
    getPrediction,
    getInsights
} = require("../controllers/analyticsController");

// Routes
router.get("/monthly-history", authMiddleware, getMonthlyHistory);
router.get("/monthly-summary", authMiddleware, getMonthlySummary);
router.get("/category-breakdown", authMiddleware, getCategoryBreakdown);
router.get("/financial-score", authMiddleware, getFinancialScore);
router.get("/prediction", authMiddleware, getPrediction);
router.get("/insights", authMiddleware, getInsights);
module.exports = router;