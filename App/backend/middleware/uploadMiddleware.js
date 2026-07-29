const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsRoot = path.join(__dirname, "..", "uploads");
const avatarUploadDir = path.join(uploadsRoot, "avatars");

if (!fs.existsSync(avatarUploadDir)) {
  fs.mkdirSync(avatarUploadDir, { recursive: true });
}

const createDiskStorage = (destination) =>
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

const createFileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.has(file.mimetype)) return cb(null, true);
  const error = new Error("Unsupported file type.");
  error.status = 400;
  return cb(error);
};

// Materials are held in memory only long enough for the controller to upload
// them to private Cloudflare R2 storage. They are no longer written to the
// backend/uploads/materials folder.
const materialUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: createFileFilter(allowedMaterialTypes),
});

// Uploaded profile photos remain local in this patch. DiceBear avatars still
// store only their external URL. Avatar migration to R2 can be added later.
const avatarUpload = multer({
  storage: createDiskStorage(avatarUploadDir),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: createFileFilter(allowedAvatarTypes),
});

module.exports = materialUpload;
module.exports.materialUpload = materialUpload;
module.exports.avatarUpload = avatarUpload;
