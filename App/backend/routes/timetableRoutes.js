const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getTimetable,
  getTodayTimetable,
  createTimetableItem,
  updateTimetableItem,
  deleteTimetableItem,
} = require("../controllers/timetableController");

const router = express.Router();

router.get("/", protect, getTimetable);
router.get("/today", protect, getTodayTimetable);
router.post("/", protect, createTimetableItem);
router.put("/:id", protect, updateTimetableItem);
router.delete("/:id", protect, deleteTimetableItem);

module.exports = router;
