const express = require("express");
const protect = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const controller = require("../controllers/categoryController");

const router = express.Router();

router.get("/", protect, asyncHandler(controller.getCategories));
router.post("/", protect, asyncHandler(controller.createCategory));
router.put("/:id", protect, asyncHandler(controller.updateCategory));
router.delete("/:id", protect, asyncHandler(controller.deleteCategory));

module.exports = router;
