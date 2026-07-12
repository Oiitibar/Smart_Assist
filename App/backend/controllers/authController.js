const jwt = require("jsonwebtoken");
const User = require("../models/User");

const cookieName = () => process.env.JWT_COOKIE_NAME || "token";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const sendTokenCookie = (res, token) => {
  res.cookie(cookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearTokenCookie = (res) => {
  res.clearCookie(cookieName(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
};

const getUserIdFromRequest = (req) => {
  return req.user?._id || req.user?.id || req.user?.userId;
};

const userPayload = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name || user.fullName || "",
  fullName: user.fullName || user.name || "",
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  profile: user.profile,
  preferences: user.preferences,
});

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const name = req.body.name || req.body.fullName;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = await User.create({
      name,
      fullName: name,
      email,
      password,
    });

    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    const payload = userPayload(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: payload,
      data: {
        user: payload,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    user.password = undefined;

    const payload = userPayload(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: payload,
      data: {
        user: payload,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  clearTokenCookie(res);

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const me = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const payload = userPayload(user);

    return res.status(200).json({
      success: true,
      user: payload,
      data: {
        user: payload,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while getting user",
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile or PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      name,
      fullName,
      email,
      phone,
      school,
      grade,
      subjects,
      avatarUrl,
    } = req.body;

    const finalName = name || fullName;

    if (finalName !== undefined) {
      user.name = finalName;
      user.fullName = finalName;
    }

    if (email !== undefined) user.email = email;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    if (!user.profile) user.profile = {};

    if (phone !== undefined) user.profile.phone = phone;
    if (school !== undefined) user.profile.school = school;
    if (grade !== undefined) user.profile.grade = grade;
    if (subjects !== undefined) user.profile.subjects = subjects;

    const updatedUser = await user.save();
    const payload = userPayload(updatedUser);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: payload,
      data: {
        user: payload,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

module.exports = {
  // New ZIP route naming
  register,
  login,
  logout,
  me,

  // Old project route naming compatibility
  registerUser: register,
  loginUser: login,
  logoutUser: logout,
  getMe: me,

  updateProfile,
};