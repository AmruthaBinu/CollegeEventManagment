const express = require("express");
const Event = require("../models/event");
const Department = require("../models/department"); // 👈 Added
const verifyToken = require("../middleware/auth");
const allowRoles = require("../middleware/role");

const router = express.Router();

/* ===================================
   CREATE EVENT (Faculty Only)
=================================== */

router.post(
  "/",
  verifyToken,
  allowRoles("Faculty"),
  async (req, res) => {
    try {

      const { title, description, eventType, date, venue, department } = req.body;

      const newEvent = new Event({
        title,
        description,
        eventType,
        date,
        venue,
        department,
        createdBy: req.user.userId
      });

      await newEvent.save();

      res.json({ status: "Event created successfully" });

    } catch (error) {
      res.json({ status: "Error", error: error.message });
    }
  }
);

/* ===================================
   GET ALL EVENTS (Recent First)
=================================== */

router.get("/", verifyToken, async (req, res) => {
  try {

    const events = await Event.find()
      .populate("department", "name code")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(events);

  } catch (error) {
    res.json({ status: "Error", error: error.message });
  }
});

/* ===================================
   GET EVENTS BY DEPARTMENT CODE
   Example: /api/events/department/CSE
=================================== */

router.get("/department/:code", verifyToken, async (req, res) => {
  try {

    // Step 1: Find department by code
    const department = await Department.findOne({
      code: req.params.code
    });

    if (!department) {
      return res.json({ status: "Department not found" });
    }

    // Step 2: Find events using department ID
    const events = await Event.find({
      department: department._id
    })
    .populate("department", "name code")
    .populate("createdBy", "name")
    .sort({ createdAt: -1 });

    res.json(events);

  } catch (error) {
    res.json({ status: "Error", error: error.message });
  }
});

/* ===================================
   UPDATE EVENT (Faculty Creator Only)
=================================== */

router.put(
  "/:id",
  verifyToken,
  allowRoles("Faculty"),
  async (req, res) => {
    try {

      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.json({ status: "Event not found" });
      }

      if (event.createdBy.toString() !== req.user.userId) {
        return res.json({ status: "You can only update your own events" });
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        req.body,
        { returnDocument: "after" }
      );

      res.json({
        status: "Event updated successfully",
        data: updatedEvent
      });

    } catch (error) {
      res.json({ status: "Error", error: error.message });
    }
  }
);

/* ===================================
   DELETE EVENT (Admin OR Creator Faculty)
=================================== */

router.delete(
  "/:id",
  verifyToken,
  async (req, res) => {
    try {

      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.json({ status: "Event not found" });
      }

      if (req.user.role === "Admin") {
        await Event.findByIdAndDelete(req.params.id);
        return res.json({ status: "Event deleted by Admin" });
      }

      if (
        req.user.role === "Faculty" &&
        event.createdBy.toString() === req.user.userId
      ) {
        await Event.findByIdAndDelete(req.params.id);
        return res.json({ status: "Event deleted successfully" });
      }

      return res.json({ status: "Access denied" });

    } catch (error) {
      res.json({ status: "Error", error: error.message });
    }
  }
);

module.exports = router;