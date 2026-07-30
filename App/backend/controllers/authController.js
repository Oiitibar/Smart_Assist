const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { isSourceSuperAdmin } = require("../config/superAdmins");

const getCookieName = () => process.env.JWT_COOKIE_NAME || "study_jwt";

const requireJwtSecret = () => {
  const secret = String(process.env.JWT_SECRET || "").trim();

  if (!secret) {
    const error = new Error("JWT_SECRET is not configured");
    error.status = 500;
    throw error;
  }

  return secret;
};

const generateToken = (userId) =>
  jwt.sign(
    { id: String(userId) },
    requireJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );

const isProduction = () => process.env.NODE_ENV === "production";

const shouldUsePartitionedCookie = () =>
  isProduction() &&
  String(process.env.JWT_COOKIE_PARTITIONED || "false").toLowerCase() ===
    "true";

const cookieBaseOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: isProduction() ? "none" : "lax",
  path: "/",
  ...(shouldUsePartitionedCookie() ? { partitioned: true } : {}),
});

const cookieOptions = () => ({
  ...cookieBaseOptions(),
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const userPayload = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  fullName: user.fullName || user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  profile: user.profile,
  preferences: user.preferences,
  studyData: user.studyData,
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt,
  lastActiveAt: user.lastActiveAt,
});

const sendAuthResponse = (res, statusCode, user, token) => {
  const safeUser = userPayload(user);

  // Keep the HttpOnly cookie for same-site/custom-domain deployments.
  res.cookie(getCookieName(), token, cookieOptions());

  // Prevent browsers and proxies from caching an authentication response.
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");

  // The token is also returned as a fallback for cross-site deployments
  // (for example localhost/Vercel frontend -> onrender.com backend), where
  // browser privacy settings can block third-party cookies. The frontend
  // sends this token using Authorization: Bearer <token>.
  return res.status(statusCode).json({
    success: true,
    token,
    user: safeUser,
    data: {
      token,
      user: safeUser,
    },
  });
};

const register = async (req, res) => {
  const name = String(req.body.name || req.body.fullName || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const now = new Date();
  const user = await User.create({
    name,
    fullName: name,
    email,
    password,
    role: isSourceSuperAdmin(email) ? "super_admin" : "student",
    lastLoginAt: now,
    lastActiveAt: now,
  });

  const token = generateToken(user._id);
  return sendAuthResponse(res, 201, user, token);
};

const login = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const expectedRole = isSourceSuperAdmin(user.email)
    ? "super_admin"
    : user.role === "super_admin"
      ? "student"
      : user.role;

  user.role = expectedRole;
  user.lastLoginAt = new Date();
  user.lastActiveAt = user.lastLoginAt;
  await user.save();

  const token = generateToken(user._id);
  return sendAuthResponse(res, 200, user, token);
};

const logout = async (req, res) => {
  const options = cookieBaseOptions();

  // Clear the configured cookie and names used by older project versions.
  for (const cookieName of new Set([
    getCookieName(),
    "study_jwt",
    "token",
  ])) {
    res.clearCookie(cookieName, options);
  }

  res.set("Cache-Control", "no-store");
  return res.json({ success: true, message: "Logged out successfully" });
};

const me = async (req, res) => {
  res.set("Cache-Control", "no-store");

  return res.json({
    success: true,
    user: userPayload(req.user),
    data: { user: userPayload(req.user) },
  });
};

module.exports = {
  register,
  login,
  logout,
  me,
  registerUser: register,
  loginUser: login,
  logoutUser: logout,
  getMe: me,
};
