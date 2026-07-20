const express = require("express");
const protect = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const uploadMiddleware = require("../middleware/uploadMiddleware");
const controller = require("../controllers/materialController");

const router = express.Router();

const materialUpload =
  uploadMiddleware.materialUpload ||
  uploadMiddleware;

router.get(
  "/",
  protect,
  asyncHandler(controller.getMaterials)
);

router.post(
  "/upload",
  protect,
  materialUpload.single("file"),
  asyncHandler(controller.uploadMaterial)
);

router.put(
  "/:id/category",
  protect,
  asyncHandler(controller.assignMaterialCategory)
);

router.delete(
  "/:id",
  protect,
  asyncHandler(controller.deleteMaterial)
);

module.exports = router;