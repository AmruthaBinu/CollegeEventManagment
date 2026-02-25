const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ status: "Email already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    res.json({ status: "Signup successful" });

  } catch (error) {
    res.json({ status: "Error", error: error.message });
  }
});

// SIGNIN
router.post("/signin", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.json({ status: "Invalid email" });
    }

    const validPassword = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res.json({ status: "Incorrect password" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ status: "Login successful", token });

  } catch (error) {
    res.json({ status: "Error", error: error.message });
  }
});

module.exports = router;
