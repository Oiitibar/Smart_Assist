const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  const { name, email, avatarUrl } = req.body;

  const update = {};
  if (name !== undefined) update.name = name;
  if (email !== undefined) update.email = email;
  if (avatarUrl !== undefined) update.avatarUrl = avatarUrl;

  const user = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.json({ user });
};

exports.updatePreferences = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  user.preferences = {
    ...user.preferences.toObject?.() || user.preferences,
    ...req.body,
  };
  await user.save();

  res.json({ preferences: user.preferences });
};
