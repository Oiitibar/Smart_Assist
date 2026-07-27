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
 * The controller must validate super-admin permission and inactivity first.
 */
const deleteUserAccountData = async (user) => {
  const userId = user._id;
  const materials = await Material.find({ userId })
    .select("_id storedName")
    .lean();

  // Delete database records before removing the User document so no owned data
  // is left behind with an invalid userId reference.
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

  // File removal is best-effort. Missing legacy files should not stop account
  // cleanup after the database records have already been removed.
  await Promise.all([
    removeLocalAvatar(user.avatarUrl),
    ...materials.flatMap((material) => [
      removeMaterialFile(material.storedName),
      deleteMaterialPreview(material._id),
    ]),
  ]);

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
