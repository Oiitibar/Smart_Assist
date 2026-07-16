const Timetable = require("../models/Timetable");
const Material = require("../models/Material");
const Category = require("../models/Category");
const FlashcardSet = require("../models/FlashcardSet");
const Progress = require("../models/Progress");
const Task = require("../models/Task");

const todayKey = () => new Date().toISOString().slice(0, 10);
const getTodayName = () => new Date().toLocaleDateString("en-US", { weekday: "long" });

exports.getDashboardSummary = async (req, res) => {
  const userId = req.user._id;
  const todayName = req.query.day || getTodayName();

  const [todayTimetable, materialCount, categoryCount, flashcardSets, progress, openTasks] = await Promise.all([
    Timetable.find({ userId, day: todayName }).sort({ startTime: 1 }).lean(),
    Material.countDocuments({ userId }),
    Category.countDocuments({ userId }),
    FlashcardSet.find({ userId }).select("cards categoryId").lean(),
    Progress.findOne({ userId, date: todayKey() }).lean(),
    Task.countDocuments({ userId, completed: false }),
  ]);

  const readyCards = flashcardSets.reduce((total, set) => total + (set.cards?.length || 0), 0);
  const reviewedCards = flashcardSets.reduce(
    (total, set) => total + (set.cards || []).filter((card) => card.reviewed).length,
    0,
  );
  const correctCards = flashcardSets.reduce(
    (total, set) => total + (set.cards || []).filter((card) => card.reviewed && card.correct).length,
    0,
  );

  const nextClass = todayTimetable[0] || null;

  return res.json({
    todayTimetable,
    todayFocus: {
      nextClass,
      aiSuggestion: nextClass
        ? `Prepare for ${nextClass.subject}. Review its material and flashcards before class.`
        : "No class scheduled today. Review a saved flashcard deck or upload new material.",
    },
    flashcards: {
      readyCount: readyCards,
      reviewedToday: progress?.cardsReviewed || 0,
      accuracy: reviewedCards ? Math.round((correctCards / reviewedCards) * 100) : 0,
    },
    counts: {
      categories: categoryCount,
      materials: materialCount,
      openTasks,
    },
    progress: progress || {
      tasksCompleted: 0,
      totalTasks: 0,
      cardsReviewed: 0,
      correctCards: 0,
      studyStreak: 0,
      focusMinutes: 0,
    },
  });
};
