const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

  const token = req.headers.authorization;

  if (!token) {
    return res.json({ status: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.json({ status: "Invalid token" });
  }
};

module.exports = verifyToken;
