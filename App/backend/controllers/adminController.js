const User = require("../models/User");
const Material = require("../models/Material");
const FlashcardSet = require("../models/FlashcardSet");
const QuizSet = require("../models/QuizSet");
const Task = require("../models/Task");
const { isSourceSuperAdmin } = require("../config/superAdmins");

const safeId = (value) => String(value || "");

const percentage = (score, total) =>
  total > 0 ? Math.round((score / total) * 100) : null;

const getAdminOverview = async (req, res) => {
  const query = String(req.query.search || "").trim();
  const role = String(req.query.role || "all").trim();

  const filter = {};
  if (["student", "admin", "super_admin"].includes(role)) {
    filter.role = role;
  }
  if (query) {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { fullName: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
      { "profile.school": { $regex: escaped, $options: "i" } },
      { "profile.grade": { $regex: escaped, $options: "i" } },
    ];
  }

  const [users, allUsers, materials, flashcardSets, quizSets, taskGroups] =
    await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).lean(),
      User.find({}).select("role lastActiveAt studyData").lean(),
      Material.aggregate([
        { $group: { _id: "$userId", count: { $sum: 1 }, bytes: { $sum: "$size" } } },
      ]),
      FlashcardSet.find({}).select("userId cards").lean(),
      QuizSet.find({}).select("userId questions attempts").lean(),
      Task.aggregate([
        {
          $group: {
            _id: "$userId",
            total: { $sum: 1 },
            completed: { $sum: { $cond: ["$completed", 1, 0] } },
          },
        },
      ]),
    ]);

  const materialMap = new Map(
    materials.map((item) => [safeId(item._id), { count: item.count, bytes: item.bytes }]),
  );
  const taskMap = new Map(
    taskGroups.map((item) => [safeId(item._id), { total: item.total, completed: item.completed }]),
  );
  const flashcardMap = new Map();
  for (const set of flashcardSets) {
    const id = safeId(set.userId);
    const current = flashcardMap.get(id) || { sets: 0, cards: 0, reviewed: 0 };
    current.sets += 1;
    current.cards += set.cards?.length || 0;
    current.reviewed += (set.cards || []).filter((card) => card.reviewed).length;
    flashcardMap.set(id, current);
  }

  const quizMap = new Map();
  for (const set of quizSets) {
    const id = safeId(set.userId);
    const current = quizMap.get(id) || {
      sets: 0,
      questions: 0,
      attempts: 0,
      score: 0,
      total: 0,
    };
    current.sets += 1;
    current.questions += set.questions?.length || 0;
    for (const attempt of set.attempts || []) {
      current.attempts += 1;
      current.score += Number(attempt.score || 0);
      current.total += Number(attempt.total || 0);
    }
    quizMap.set(id, current);
  }

  const userRows = users.map((user) => {
    const id = safeId(user._id);
    const material = materialMap.get(id) || { count: 0, bytes: 0 };
    const flashcard = flashcardMap.get(id) || { sets: 0, cards: 0, reviewed: 0 };
    const quiz = quizMap.get(id) || { sets: 0, questions: 0, attempts: 0, score: 0, total: 0 };
    const tasks = taskMap.get(id) || { total: 0, completed: 0 };

    return {
      id,
      name: user.name || user.fullName || "Unnamed user",
      fullName: user.fullName || user.name || "Unnamed user",
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl || "",
      profile: user.profile || {},
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt || null,
      lastActiveAt: user.lastActiveAt || null,
      study: {
        minutes: Number(user.studyData?.studyMinutes || 0),
        materials: material.count,
        materialBytes: material.bytes,
        flashcardSets: flashcard.sets,
        flashcards: flashcard.cards,
        reviewedFlashcards: flashcard.reviewed,
        quizSets: quiz.sets,
        quizQuestions: quiz.questions,
        quizAttempts: quiz.attempts,
        quizAverage: percentage(quiz.score, quiz.total),
        tasks: tasks.total,
        completedTasks: tasks.completed,
      },
    };
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const summary = {
    totalAccounts: allUsers.length,
    activeToday: allUsers.filter(
      (user) => user.lastActiveAt && new Date(user.lastActiveAt) >= today,
    ).length,
    normalAdmins: allUsers.filter((user) => user.role === "admin").length,
    superAdmins: allUsers.filter((user) => user.role === "super_admin").length,
    totalMaterials: materials.reduce((sum, item) => sum + item.count, 0),
    totalFlashcards: [...flashcardMap.values()].reduce((sum, item) => sum + item.cards, 0),
    totalQuizAttempts: [...quizMap.values()].reduce((sum, item) => sum + item.attempts, 0),
  };

  return res.json({
    success: true,
    data: {
      summary,
      users: userRows,
      permissions: {
        canManageAdmins: req.user.role === "super_admin",
      },
    },
  });
};

const updateUserRole = async (req, res) => {
  const nextRole = String(req.body.role || "").trim();
  if (!["student", "admin"].includes(nextRole)) {
    return res.status(400).json({
      message: "Normal accounts can only be assigned student or admin roles",
    });
  }

  const target = await User.findById(req.params.userId);
  if (!target) return res.status(404).json({ message: "User account not found" });

  if (isSourceSuperAdmin(target.email) || target.role === "super_admin") {
    return res.status(403).json({
      message: "Super-admin roles can only be changed in backend/config/superAdmins.js",
    });
  }

  if (safeId(target._id) === safeId(req.user._id)) {
    return res.status(400).json({ message: "You cannot change your own admin role" });
  }

  target.role = nextRole;
  await target.save();

  return res.json({
    success: true,
    message: nextRole === "admin" ? "Admin access granted" : "Admin access removed",
    data: {
      user: {
        id: safeId(target._id),
        name: target.name || target.fullName,
        email: target.email,
        role: target.role,
      },
    },
  });
};

module.exports = { getAdminOverview, updateUserRole };
