const fs = require("fs");
const path = require("path");
const Material = require("../models/Material");
const Category = require("../models/Category");
const FlashcardSet = require("../models/FlashcardSet");
const QuizSet = require("../models/QuizSet");
const { deleteMaterialPreview } = require("../services/documentPreviewService");
const {
  createMaterialKey,
  deleteObject,
  isR2Material,
  uploadBuffer,
} = require("../services/r2StorageService");

const getFileType = (filename) => {
  const extension = path
    .extname(filename)
    .replace(".", "")
    .toUpperCase();

  return extension || "FILE";
};

const removeStoredFile = async (storedName) => {
  if (!storedName) return;

  const safeName = path.basename(storedName);
  const candidates = [
    path.join(__dirname, "..", "uploads", "materials", safeName),
    path.join(__dirname, "..", "uploads", safeName),
  ];

  await Promise.all(
    candidates.map((fullPath) => fs.promises.unlink(fullPath).catch(() => {})),
  );
};

const deleteStoredMaterial = async (material) => {
  if (isR2Material(material)) {
    await deleteObject(material.storageKey);
    return;
  }

  await removeStoredFile(material.storedName);
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

  if (req.body.categoryId) {
    const category = await Category.findOne({
      _id: req.body.categoryId,
      userId: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }
  }

  const storageKey = createMaterialKey({
    userId: req.user._id,
    originalName: req.file.originalname,
  });

  let uploadedToR2 = false;

  try {
    await uploadBuffer({
      key: storageKey,
      buffer: req.file.buffer,
      contentType: req.file.mimetype,
      metadata: {
        userid: String(req.user._id),
        originalname: encodeURIComponent(req.file.originalname),
      },
    });
    uploadedToR2 = true;

    const storedName = path.basename(storageKey);
    const material = await Material.create({
      userId: req.user._id,
      categoryId: req.body.categoryId || null,
      title: String(req.body.title || req.file.originalname).trim(),
      description: String(req.body.description || "").trim(),
      originalName: req.file.originalname,
      storedName,
      storageProvider: "r2",
      storageKey,
      // This remains an internal identifier. The bucket is private and no
      // public R2 URL is returned to the frontend.
      fileUrl: `/private-materials/${encodeURIComponent(storageKey)}`,
      fileType: getFileType(req.file.originalname),
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    await material.populate("categoryId", "name color soft emoji");
    return res.status(201).json(material);
  } catch (error) {
    // If MongoDB creation fails after the R2 upload, remove the orphan object.
    if (uploadedToR2) {
      await deleteObject(storageKey).catch(() => {});
    }
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

  if (categoryId) {
    await Promise.all([
      FlashcardSet.updateMany(
        { userId: req.user._id, materialId: material._id },
        { $set: { categoryId } },
      ),
      QuizSet.updateMany(
        { userId: req.user._id, materialId: material._id },
        { $set: { categoryId } },
      ),
    ]);
  } else {
    await Promise.all([
      FlashcardSet.deleteMany({ userId: req.user._id, materialId: material._id }),
      QuizSet.deleteMany({ userId: req.user._id, materialId: material._id }),
    ]);
  }

  return res.json(material);
};

exports.deleteMaterial = async (req, res) => {
  const material = await Material.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!material) {
    return res.status(404).json({
      message: "Material not found",
    });
  }

  // Remove the private object and related generated data before deleting the
  // MongoDB material record. This avoids leaving a record that points to a
  // missing file if R2 temporarily rejects the request.
  await Promise.all([
    deleteStoredMaterial(material),
    deleteMaterialPreview(material._id),
    FlashcardSet.deleteMany({ userId: req.user._id, materialId: material._id }),
    QuizSet.deleteMany({ userId: req.user._id, materialId: material._id }),
  ]);

  await material.deleteOne();

  return res.json({
    message: "Material deleted",
  });
};
