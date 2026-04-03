const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  console.log("Authorization header:", authHeader); // DEBUG

  if (!authHeader) {
    return res.status(401).json({ msg: "No token provided" });
  }

  const parts = authHeader.split(" ");
  console.log("Header parts:", parts); // DEBUG

  if (parts.length !== 2) {
    return res.status(401).json({ msg: "Token format invalid" });
  }

  const token = parts[1];
  console.log("Extracted token:", token); // DEBUG

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // DEBUG

    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT error:", err.message); // DEBUG
    return res.status(401).json({ msg: "Invalid token" });
  }
};