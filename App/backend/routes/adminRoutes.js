const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  getAdminOverview,
  updateUserRole,
  deleteUserAccount,
} = require("../controllers/adminController");

const router = express.Router();
const protect = authMiddleware.protect || authMiddleware;

router.use(protect);
router.get(
  "/overview",
  allowRoles("admin", "super_admin"),
  asyncHandler(getAdminOverview),
);
router.patch(
  "/users/:userId/role",
  allowRoles("super_admin"),
  asyncHandler(updateUserRole),
);

router.delete(
  "/users/:userId",
  allowRoles("super_admin"),
  asyncHandler(deleteUserAccount),
);

module.exports = router;
