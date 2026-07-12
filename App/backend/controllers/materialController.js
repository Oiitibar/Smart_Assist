const path = require("path");
const Material = require("../models/Material");
const Category = require("../models/Category");

const getFileType = (filename) => {
  const ext = path.extname(filename).replace(".", "").toUpperCase();
  return ext || "FILE";
};

exports.getMaterials = async (req, res) => {
  const materials = await Material.find({ userId: req.user._id })
    .populate("categoryId", "name color")
    .sort({ createdAt: -1 });

  res.json(materials);
};

exports.uploadMaterial = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "File is required" });
  }

  const material = await Material.create({
    userId: req.user._id,
    categoryId: req.body.categoryId || null,
    title: req.body.title || req.file.originalname,
    originalName: req.file.originalname,
    fileUrl: `/uploads/${req.file.filename}`,
    fileType: getFileType(req.file.originalname),
    mimeType: req.file.mimetype,
    size: req.file.size,
  });

  res.status(201).json(material);
};

exports.assignMaterialCategory = async (req, res) => {
  const { categoryId } = req.body;

  const material = await Material.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { categoryId: categoryId || null },
    { new: true }
  ).populate("categoryId", "name color");

  if (!material) return res.status(404).json({ message: "Material not found" });
  res.json(material);
};

exports.deleteMaterial = async (req, res) => {
  const material = await Material.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!material) return res.status(404).json({ message: "Material not found" });
  res.json({ message: "Material deleted" });
};
