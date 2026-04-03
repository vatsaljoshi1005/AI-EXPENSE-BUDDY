const {registerUser, loginUser}=require("../controllers/authController");
const express = require('express');
const router = express.Router();
const authMiddleware=require('../middleware/authMiddleware');

// SIGNUP ROUTE
router.post('/signup',registerUser);
// LOGIN ROUTE
router.post('/login',loginUser);
const User = require("../models/User");

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json({
      msg: "Welcome to dashboard",
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;