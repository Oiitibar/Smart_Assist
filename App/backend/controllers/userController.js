const path = require("path");
const fs = require("fs");
const User = require("../models/User");

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
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl: `/uploads/${req.file.filename}` },
    { new: true },
  );

  if (previousAvatar?.startsWith("/uploads/")) {
    const previousName = path.basename(previousAvatar);
    const newName = path.basename(req.file.filename);
    if (previousName !== newName) {
      const previousPath = path.join(__dirname, "..", "uploads", previousName);
      await fs.promises.unlink(previousPath).catch(() => {});
    }
  }

  return res.json({ user: userPayload(user), data: { user: userPayload(user) } });
};
