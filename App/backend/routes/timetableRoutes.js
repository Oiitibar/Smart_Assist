const express = require("express");
const protect = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const controller = require("../controllers/timetableController");

const router = express.Router();

router.get("/", protect, asyncHandler(controller.getTimetable));
router.get("/today", protect, asyncHandler(controller.getTodayTimetable));
router.post("/", protect, asyncHandler(controller.createTimetableItem));
router.put("/:id", protect, asyncHandler(controller.updateTimetableItem));
router.delete("/:id", protect, asyncHandler(controller.deleteTimetableItem));

module.exports = router;
