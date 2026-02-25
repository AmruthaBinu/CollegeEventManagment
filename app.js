// Load environment variables
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = require("./models/users");
const departmentRoutes = require("./routes/departmentRoutes");
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");


const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/departments", departmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);


/* ===============================
   MongoDB Connection
================================= */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

/* ==========================================
   CREATE ADMIN (Run Once Then Remove Route)
============================================= */

app.post("/create-admin", async (req, res) => {
  try {

    const existingAdmin = await userModel.findOne({ role: "Admin" });

    if (existingAdmin) {
      return res.json({ status: "Admin already exists" });
    }

    const hashedPassword = bcrypt.hashSync("admin123", 10);

    const adminUser = new userModel({
      name: "Amrutha",
      email: "amruthabinu133@gmail.com",
      password: hashedPassword,
      role: "Admin"
    });

    await adminUser.save();

    res.json({ status: "Admin created successfully" });

  } catch (error) {
    res.json({ status: "Error", error: error.message });
  }
});

/* ===============================
   SIGNUP API (Student Only)
================================= */

app.post("/signup", async (req, res) => {
  try {

    const { name, email, password } = req.body;

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ status: "Email already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      role: "Student"   // Default role
    });

    await newUser.save();

    res.json({ status: "Signup successful (Student)" });

  } catch (error) {
    res.json({ status: "Error", error: error.message });
  }
});

/* ===============================
   SIGNIN API (All Roles)
================================= */

app.post("/signin", async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await userModel.findOne({ email });


    if (!user) {
      return res.json({ status: "Invalid email id" });
    }

    const passwordValidator = bcrypt.compareSync(
      password,
      user.password
    );

    if (!passwordValidator) {
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

    res.json({
      status: "Login successful",
      token,
      role: user.role
    });
    

  } catch (error) {
    res.json({ status: "Error", error: error.message });
  }
});

/* ===============================
   Start Server
================================= */

app.listen(4050, () => {
  console.log("Server Started on port 4050");
});
