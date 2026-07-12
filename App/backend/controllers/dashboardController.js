const Timetable = require("../models/Timetable");
const Material = require("../models/Material");
const Category = require("../models/Category");
const FlashcardSet = require("../models/FlashcardSet");
const Progress = require("../models/Progress");

const todayKey = () => new Date().toISOString().slice(0, 10);
const getTodayName = () => new Date().toLocaleDateString("en-US", { weekday: "long" });

const sortByStartTime = (items) => {
  return items.sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
};

exports.getDashboardSummary = async (req, res) => {
  const userId = req.user._id;
  const todayName = req.query.day || getTodayName();

  const [todayTimetable, recentMaterials, categories, flashcardSets, progress] = await Promise.all([
    Timetable.find({ userId, day: todayName }).lean(),
    Material.find({ userId }).populate("categoryId", "name color").sort({ createdAt: -1 }).limit(5).lean(),
    Category.find({ userId }).sort({ createdAt: -1 }).limit(8).lean(),
    FlashcardSet.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
    Progress.findOne({ userId, date: todayKey() }).lean(),
  ]);

  const sortedTimetable = sortByStartTime(todayTimetable);
  const nextClass = sortedTimetable[0] || null;
  const readyCards = flashcardSets.reduce((total, set) => total + (set.cards?.length || 0), 0);
  const reviewedCards = flashcardSets.reduce(
    (total, set) => total + (set.cards || []).filter((card) => card.reviewed).length,
    0
  );

  const accuracy = reviewedCards
    ? Math.round(
        (flashcardSets.reduce(
          (total, set) => total + (set.cards || []).filter((card) => card.reviewed && card.correct).length,
          0
        ) /
          reviewedCards) *
          100
      )
    : 0;

  res.json({
    todayTimetable: sortedTimetable,
    todayFocus: {
      nextClass,
      aiSuggestion: nextClass
        ? `Prepare for ${nextClass.subject}. Review related materials and practice flashcards before class.`
        : "No class scheduled today. Review saved flashcards or upload new study materials.",
    },
    flashcards: {
      readyCount: readyCards,
      reviewedToday: progress?.cardsReviewed || 0,
      accuracy,
      recentSets: flashcardSets,
    },
    progress: {
      tasksCompleted: progress?.tasksCompleted || 0,
      totalTasks: progress?.totalTasks || sortedTimetable.length,
      cardsReviewed: progress?.cardsReviewed || 0,
      studyStreak: progress?.studyStreak || 0,
      focusMinutes: progress?.focusMinutes || 0,
      accuracy,
    },
    recentMaterials,
    categories,
  });
};
