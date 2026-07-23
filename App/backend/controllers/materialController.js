const fs = require("fs");
const path = require("path");
const Material = require("../models/Material");
const Category = require("../models/Category");
const FlashcardSet = require("../models/FlashcardSet");
const { deleteMaterialPreview } = require("../services/documentPreviewService");

const getFileType = (filename) => {
  const extension = path
    .extname(filename)
    .replace(".", "")
    .toUpperCase();

  return extension || "FILE";
};

const removeStoredFile = async (storedName) => {
  if (!storedName) return;

  const fullPath = path.join(
    __dirname,
    "..",
    "uploads",
    path.basename(storedName),
  );

  await fs.promises.unlink(fullPath).catch(() => {});
};

exports.getMaterials = async (req, res) => {
  const materials = await Material.find({
    userId: req.user._id,
  })
    .populate("categoryId", "name color soft emoji")
    .sort({ createdAt: -1 });

  return res.json(materials);
};

exports.uploadMaterial = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message:
        'File is required. Send multipart/form-data using the field name "file".',
    });
  }

  try {
    if (req.body.categoryId) {
      const category = await Category.findOne({
        _id: req.body.categoryId,
        userId: req.user._id,
      });

      if (!category) {
        await removeStoredFile(req.file.filename);

        return res.status(404).json({
          message: "Category not found",
        });
      }
    }

    const material = await Material.create({
      userId: req.user._id,
      categoryId: req.body.categoryId || null,
      title: String(
        req.body.title || req.file.originalname,
      ).trim(),
      description: String(
        req.body.description || "",
      ).trim(),
      originalName: req.file.originalname,
      storedName: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: getFileType(req.file.originalname),
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    await material.populate(
      "categoryId",
      "name color soft emoji",
    );

    return res.status(201).json(material);
  } catch (error) {
    // Multer already saved the file. Remove it if database saving fails.
    await removeStoredFile(req.file.filename);
    throw error;
  }
};

exports.assignMaterialCategory = async (req, res) => {
  const { categoryId } = req.body;

  if (categoryId) {
    const category = await Category.findOne({
      _id: categoryId,
      userId: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }
  }

  const material = await Material.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user._id,
    },
    {
      categoryId: categoryId || null,
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate("categoryId", "name color soft emoji");

  if (!material) {
    return res.status(404).json({
      message: "Material not found",
    });
  }

  return res.json(material);
};

exports.deleteMaterial = async (req, res) => {
  const material = await Material.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!material) {
    return res.status(404).json({
      message: "Material not found",
    });
  }

  await Promise.all([
    removeStoredFile(material.storedName),
    deleteMaterialPreview(material._id),
    FlashcardSet.deleteMany({ userId: req.user._id, materialId: material._id }),
  ]);

  return res.json({
    message: "Material deleted",
  });
};
