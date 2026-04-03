const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { handleAIChat } = require("../controllers/aiController");

router.post("/chat", authMiddleware, handleAIChat);

module.exports = router;