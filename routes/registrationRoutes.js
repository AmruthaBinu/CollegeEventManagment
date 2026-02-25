const express = require("express");
const Registration = require("../models/registration");
const Event = require("../models/event");
const verifyToken = require("../middleware/auth");
const allowRoles = require("../middleware/role");

const router = express.Router();

/* ===================================
   STUDENT REGISTER FOR EVENT
   POST /api/registrations
=================================== */

router.post(
  "/",
  verifyToken,
  allowRoles("Student"),
  async (req, res) => {
    try {

      const { eventId } = req.body;

      const event = await Event.findById(eventId);

      if (!event) {
        return res.json({ status: "Event not found" });
      }

      if (!event.registrationEnabled) {
        return res.json({ status: "Registration is closed for this event" });
      }

      const registration = new Registration({
        student: req.user.userId,
        event: eventId
      });

      await registration.save();

      res.json({ status: "Registered successfully" });

    } catch (error) {
      if (error.code === 11000) {
        return res.json({ status: "Already registered for this event" });
      }
      res.json({ status: "Error", error: error.message });
    }
  }
);

/* ===================================
   GET MY REGISTRATIONS (Student)
=================================== */

router.get(
  "/my",
  verifyToken,
  allowRoles("Student"),
  async (req, res) => {
    try {

      const registrations = await Registration.find({
        student: req.user.userId
      })
      .populate("event", "title date venue")
      .sort({ createdAt: -1 });

      res.json(registrations);

    } catch (error) {
      res.json({ status: "Error", error: error.message });
    }
  }
);

/* ===================================
   GET REGISTRATIONS FOR EVENT (Faculty)
=================================== */

router.get(
  "/event/:eventId",
  verifyToken,
  allowRoles("Faculty"),
  async (req, res) => {
    try {

      const registrations = await Registration.find({
        event: req.params.eventId
      })
      .populate("student", "name email");

      res.json(registrations);

    } catch (error) {
      res.json({ status: "Error", error: error.message });
    }
  }
);

/* ===================================
   CANCEL REGISTRATION (Student)
=================================== */

router.delete(
  "/:id",
  verifyToken,
  allowRoles("Student"),
  async (req, res) => {
    try {

      const registration = await Registration.findById(req.params.id);

      if (!registration) {
        return res.json({ status: "Registration not found" });
      }

      if (registration.student.toString() !== req.user.userId) {
        return res.json({ status: "Access denied" });
      }

      await Registration.findByIdAndDelete(req.params.id);

      res.json({ status: "Registration cancelled" });

    } catch (error) {
      res.json({ status: "Error", error: error.message });
    }
  }
);

module.exports = router;