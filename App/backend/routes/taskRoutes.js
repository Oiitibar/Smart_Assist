const express = require("express");
const protect = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const controller = require("../controllers/taskController");

const router = express.Router();

router.get("/", protect, asyncHandler(controller.getTasks));
router.post("/", protect, asyncHandler(controller.createTask));
router.patch("/:id/complete", protect, asyncHandler(controller.completeTask));
router.delete("/:id", protect, asyncHandler(controller.deleteTask));

module.exports = router;
