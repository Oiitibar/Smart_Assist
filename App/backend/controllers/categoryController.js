const Category = require("../models/Category");
const Material = require("../models/Material");

exports.getCategories = async (req, res) => {
  const categories = await Category.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();

  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const count = await Material.countDocuments({ userId: req.user._id, categoryId: category._id });
      return { ...category, count };
    })
  );

  res.json(categoriesWithCounts);
};

exports.createCategory = async (req, res) => {
  const { name, color } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const category = await Category.create({ userId: req.user._id, name, color });
  res.status(201).json(category);
};

exports.updateCategory = async (req, res) => {
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!category) return res.status(404).json({ message: "Category not found" });
  res.json(category);
};

exports.deleteCategory = async (req, res) => {
  const category = await Category.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!category) return res.status(404).json({ message: "Category not found" });

  await Material.updateMany(
    { userId: req.user._id, categoryId: req.params.id },
    { $set: { categoryId: null } }
  );

  res.json({ message: "Category deleted" });
};
