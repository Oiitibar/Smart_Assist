const express = require("express");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  getMaterials,
  uploadMaterial,
  assignMaterialCategory,
  deleteMaterial,
} = require("../controllers/materialController");

const router = express.Router();

router.get("/", protect, getMaterials);
router.post("/upload", protect, upload.single("file"), uploadMaterial);
router.put("/:id/category", protect, assignMaterialCategory);
router.delete("/:id", protect, deleteMaterial);

module.exports = router;
