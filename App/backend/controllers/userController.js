const path = require("path");
const fs = require("fs");
const User = require("../models/User");


const removeLocalAvatar = async (avatarUrl) => {
  if (!avatarUrl?.startsWith("/uploads/")) return;

  const filename = path.basename(avatarUrl);
  const candidates = [
    path.join(__dirname, "..", "uploads", "avatars", filename),
    path.join(__dirname, "..", "uploads", filename),
  ];

  await Promise.all(
    candidates.map((filePath) => fs.promises.unlink(filePath).catch(() => {})),
  );
};

const normalizeFreeAvatarUrl = (rawValue) => {
  const value = String(rawValue || "").trim();
  if (!value) return "";
  if (value.length > 500) {
    const error = new Error("Avatar URL is too long");
    error.status = 400;
    throw error;
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    const error = new Error("Invalid avatar URL");
    error.status = 400;
    throw error;
  }

  const validPath = /^\/10\.x\/lorelei\/svg\/?$/.test(url.pathname);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "api.dicebear.com" ||
    !validPath ||
    !url.searchParams.get("seed")
  ) {
    const error = new Error("Only approved DiceBear avatars can be selected");
    error.status = 400;
    throw error;
  }

  return url.toString();
};

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
});

exports.updateProfile = async (req, res) => {
  const fullName = req.body.fullName ?? req.body.name;
  const subjects = Array.isArray(req.body.subjects)
    ? req.body.subjects.map((value) => String(value).trim()).filter(Boolean)
    : undefined;

  const update = {};
  if (fullName !== undefined) {
    update.name = String(fullName).trim();
    update.fullName = String(fullName).trim();
  }
  if (req.body.phone !== undefined) update["profile.phone"] = String(req.body.phone).trim();
  if (req.body.school !== undefined) update["profile.school"] = String(req.body.school).trim();
  if (req.body.grade !== undefined) update["profile.grade"] = String(req.body.grade).trim();
  if (subjects !== undefined) update["profile.subjects"] = subjects;

  const user = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  });

  return res.json({ user: userPayload(user), data: { user: userPayload(user) } });
};

exports.updatePreferences = async (req, res) => {
  const allowed = [
    "theme",
    "darkMode",
    "notifications",
    "studyReminder",
    "language",
    "timetableView",
    "flashcardMode",
  ];

  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[`preferences.${key}`] = req.body[key];
  }

  if (req.body.darkMode !== undefined && req.body.theme === undefined) {
    update["preferences.theme"] = req.body.darkMode ? "dark" : "light";
  }
  if (req.body.theme !== undefined && req.body.darkMode === undefined) {
    update["preferences.darkMode"] = req.body.theme === "dark";
  }

  const user = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  });

  return res.json({ preferences: user.preferences, user: userPayload(user) });
};

exports.uploadAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Avatar image is required" });

  const previousAvatar = req.user.avatarUrl;
  const nextAvatar = `/uploads/avatars/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl: nextAvatar },
    { new: true },
  );

  if (previousAvatar !== nextAvatar) {
    await removeLocalAvatar(previousAvatar);
  }

  return res.json({ user: userPayload(user), data: { user: userPayload(user) } });
};

exports.setAvatar = async (req, res) => {
  const avatarUrl = normalizeFreeAvatarUrl(req.body.avatarUrl);
  const previousAvatar = req.user.avatarUrl;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl },
    { new: true, runValidators: true },
  );

  if (previousAvatar !== avatarUrl) {
    await removeLocalAvatar(previousAvatar);
  }

  return res.json({ user: userPayload(user), data: { user: userPayload(user) } });
};
