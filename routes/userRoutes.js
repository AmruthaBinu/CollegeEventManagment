const express = require("express");
const bcrypt = require("bcrypt");
const userModel = require("../models/users");
const verifyToken = require("../middleware/auth");
const allowRoles = require("../middleware/role");

const router = express.Router();

/* =========================================
   CREATE FACULTY (Admin Only)
   POST /api/users/create-faculty
========================================== */

router.post(
  "/create-faculty",
  verifyToken,              // Check JWT
  allowRoles("Admin"),      // Allow only Admin
  async (req, res) => {
    try {

      const { name, email, password } = req.body;

      // Check if email already exists
      const existingUser = await userModel.findOne({ email });

      if (existingUser) {
        return res.json({ status: "Email already exists" });
      }

      // Hash password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Create Faculty user
      const facultyUser = new userModel({
        name,
        email,
        password: hashedPassword,
        role: "Faculty"
      });

      await facultyUser.save();

      res.json({ status: "Faculty created successfully" });

    } catch (error) {
      res.json({ status: "Error", error: error.message });
    }
  }
);

module.exports = router;
