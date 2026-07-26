const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsRoot = path.join(__dirname, "..", "uploads");
const materialUploadDir = path.join(uploadsRoot, "materials");
const avatarUploadDir = path.join(uploadsRoot, "avatars");

for (const directory of [materialUploadDir, avatarUploadDir]) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

const createStorage = (destination) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, destination),
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const safeBase = path
        .basename(file.originalname, extension)
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80);

      cb(
        null,
        `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeBase}${extension}`,
      );
    },
  });

const allowedMaterialTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const allowedAvatarTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const createUpload = ({ allowedTypes, fileSize, destination }) =>
  multer({
    storage: createStorage(destination),
    limits: { fileSize },
    fileFilter: (req, file, cb) => {
      if (allowedTypes.has(file.mimetype)) return cb(null, true);
      const error = new Error("Unsupported file type.");
      error.status = 400;
      return cb(error);
    },
  });

const materialUpload = createUpload({
  allowedTypes: allowedMaterialTypes,
  fileSize: 50 * 1024 * 1024,
  destination: materialUploadDir,
});

const avatarUpload = createUpload({
  allowedTypes: allowedAvatarTypes,
  fileSize: 2 * 1024 * 1024,
  destination: avatarUploadDir,
});

module.exports = materialUpload;
module.exports.materialUpload = materialUpload;
module.exports.avatarUpload = avatarUpload;
