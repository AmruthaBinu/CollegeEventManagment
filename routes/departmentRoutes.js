const express = require("express");
const Department = require("../models/department");
const verifyToken = require("../middleware/auth");
const allowRoles = require("../middleware/role");

const router = express.Router();

// CREATE Department (Admin Only)
router.post(
  "/",
  verifyToken,
  allowRoles("Admin"),
  async (req, res) => {
    try {
      const { name, code, description } = req.body;

      const existingDept = await Department.findOne({ name });
      if (existingDept) {
        return res.json({ status: "Department already exists" });
      }

      const newDept = new Department({ name, code, description });
      await newDept.save();

      res.json({ status: "Department created successfully" });

    } catch (error) {
      res.json({ status: "Error", error: error.message });
    }
  }
);

// GET All Departments
router.get("/", verifyToken, async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.json({ status: "Error", error: error.message });
  }
});

// DELETE Department (Admin Only)
router.delete(
  "/:id",
  verifyToken,
  allowRoles("Admin"),
  async (req, res) => {
    try {
      await Department.findByIdAndDelete(req.params.id);
      res.json({ status: "Department deleted successfully" });
    } catch (error) {
      res.json({ status: "Error", error: error.message });
    }
  }
);

module.exports = router;
