const express = require("express");
const protect = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const { getDashboardSummary } = require("../controllers/dashboardController");

const router = express.Router();
router.get("/summary", protect, asyncHandler(getDashboardSummary));
module.exports = router;
