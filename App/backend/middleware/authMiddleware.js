const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { isSourceSuperAdmin } = require("../config/superAdmins");

const getCookieName = () => process.env.JWT_COOKIE_NAME || "token";

const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.[getCookieName()] || req.cookies?.study_jwt;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token found.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Invalid token payload.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. User not found.",
      });
    }

    const sourceSuperAdmin = isSourceSuperAdmin(user.email);
    const expectedRole = sourceSuperAdmin
      ? "super_admin"
      : user.role === "super_admin"
        ? "student"
        : user.role;

    const now = new Date();
    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
    const shouldRefreshActivity =
      !lastActive || now.getTime() - lastActive.getTime() >= 5 * 60 * 1000;

    if (user.role !== expectedRole || shouldRefreshActivity) {
      user.role = expectedRole;
      if (shouldRefreshActivity) user.lastActiveAt = now;
      await user.save();
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
};

module.exports = protect;
module.exports.protect = protect;
