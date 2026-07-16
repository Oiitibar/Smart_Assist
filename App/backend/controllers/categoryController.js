const Category = require("../models/Category");
const Material = require("../models/Material");
const FlashcardSet = require("../models/FlashcardSet");

exports.getCategories = async (req, res) => {
  const categories = await Category.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  const counts = await Material.aggregate([
    { $match: { userId: req.user._id } },
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((entry) => [String(entry._id), entry.count]));

  return res.json(categories.map((category) => ({
    ...category,
    count: countMap.get(String(category._id)) || 0,
  })));
};

exports.createCategory = async (req, res) => {
  const name = String(req.body.name || "").trim();
  if (!name) return res.status(400).json({ message: "Category name is required" });

  const category = await Category.create({
    userId: req.user._id,
    name,
    color: req.body.color || "#4f46e5",
    soft: req.body.soft || "#eef2ff",
    emoji: req.body.emoji || "📘",
  });

  return res.status(201).json(category);
};

exports.updateCategory = async (req, res) => {
  const allowed = ["name", "color", "soft", "emoji"];
  const update = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowed.includes(key)),
  );

  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    update,
    { new: true, runValidators: true },
  );

  if (!category) return res.status(404).json({ message: "Category not found" });
  return res.json(category);
};

exports.deleteCategory = async (req, res) => {
  const category = await Category.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!category) return res.status(404).json({ message: "Category not found" });

  await Promise.all([
    Material.updateMany(
      { userId: req.user._id, categoryId: category._id },
      { $set: { categoryId: null } },
    ),
    FlashcardSet.deleteMany({ userId: req.user._id, categoryId: category._id }),
  ]);

  return res.json({ message: "Category deleted" });
};
