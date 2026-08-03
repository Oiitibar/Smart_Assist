const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Material = require("../models/Material");
const Category = require("../models/Category");
const FlashcardSet = require("../models/FlashcardSet");
const QuizSet = require("../models/QuizSet");
const Task = require("../models/Task");
const Timetable = require("../models/Timetable");
const Progress = require("../models/Progress");
const { deleteMaterialPreview } = require("./documentPreviewService");
const { deleteObject, isR2Material } = require("./r2StorageService");

const removeFileCandidates = async (paths) => {
  await Promise.all(
    paths.map((filePath) => fs.promises.unlink(filePath).catch(() => {})),
  );
};

const removeMaterialFile = async (storedName) => {
  if (!storedName) return;
  const safeName = path.basename(storedName);
  await removeFileCandidates([
    path.join(__dirname, "..", "uploads", "materials", safeName),
    path.join(__dirname, "..", "uploads", safeName),
  ]);
};

const removeStoredMaterial = async (material) => {
  if (isR2Material(material)) {
    await deleteObject(material.storageKey);
    return;
  }
  await removeMaterialFile(material.storedName);
};

const removeLocalAvatar = async (avatarUrl) => {
  if (!String(avatarUrl || "").startsWith("/uploads/")) return;
  const safeName = path.basename(avatarUrl);
  await removeFileCandidates([
    path.join(__dirname, "..", "uploads", "avatars", safeName),
    path.join(__dirname, "..", "uploads", safeName),
  ]);
};

/**
 * Permanently removes a user and all records/files owned by that user.
 * The controller must validate super-admin permission and protected-account rules first.
 */
const deleteUserAccountData = async (user) => {
  const userId = user._id;
  const materials = await Material.find({ userId })
    .select("_id storedName storageProvider storageKey")
    .lean();

  // Remove private file objects first. If R2 is temporarily unavailable, stop
  // before deleting the database records so files do not become orphaned.
  await Promise.all(
    materials.flatMap((material) => [
      removeStoredMaterial(material),
      deleteMaterialPreview(material._id),
    ]),
  );

  const [categories, materialRecords, flashcards, quizzes, tasks, timetable, progress] =
    await Promise.all([
      Category.deleteMany({ userId }),
      Material.deleteMany({ userId }),
      FlashcardSet.deleteMany({ userId }),
      QuizSet.deleteMany({ userId }),
      Task.deleteMany({ userId }),
      Timetable.deleteMany({ userId }),
      Progress.deleteMany({ userId }),
    ]);

  await User.deleteOne({ _id: userId });
  await removeLocalAvatar(user.avatarUrl);

  return {
    categories: categories.deletedCount || 0,
    materials: materialRecords.deletedCount || 0,
    flashcardSets: flashcards.deletedCount || 0,
    quizSets: quizzes.deletedCount || 0,
    tasks: tasks.deletedCount || 0,
    timetableEntries: timetable.deletedCount || 0,
    progressRecords: progress.deletedCount || 0,
  };
};

module.exports = { deleteUserAccountData };
