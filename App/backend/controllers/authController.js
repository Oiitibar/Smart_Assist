const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { isSourceSuperAdmin } = require("../config/superAdmins");

const getCookieName = () => process.env.JWT_COOKIE_NAME || "token";

const generateToken = (userId) => jwt.sign(
  { id: userId },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
);

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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

const register = async (req, res) => {
  const name = String(req.body.name || req.body.fullName || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
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
  res.cookie(getCookieName(), token, cookieOptions());

  return res.status(201).json({
    success: true,
    user: userPayload(user),
    data: { user: userPayload(user) },
  });
};

const login = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
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
  res.cookie(getCookieName(), token, cookieOptions());

  return res.json({
    success: true,
    user: userPayload(user),
    data: { user: userPayload(user) },
  });
};

const logout = async (req, res) => {
  res.clearCookie(getCookieName(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.clearCookie("study_jwt");
  return res.json({ success: true, message: "Logged out successfully" });
};

const me = async (req, res) => {
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
