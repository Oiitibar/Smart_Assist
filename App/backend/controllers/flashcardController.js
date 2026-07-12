const FlashcardSet = require("../models/FlashcardSet");
const Material = require("../models/Material");
const Category = require("../models/Category");
const Progress = require("../models/Progress");

const todayKey = () => new Date().toISOString().slice(0, 10);

const makeSampleCards = (title, difficulty, count) => {
  const safeCount = Math.max(1, Math.min(Number(count) || 10, 30));
  return Array.from({ length: safeCount }).map((_, index) => ({
    question: `Question ${index + 1}: What is an important concept from ${title}?`,
    answer: `Answer ${index + 1}: This card should be generated from the uploaded material. Replace this placeholder with real AI output later.`,
    difficulty: difficulty || "Medium",
  }));
};

exports.getFlashcardSets = async (req, res) => {
  const sets = await FlashcardSet.find({ userId: req.user._id })
    .populate("materialId", "title fileType")
    .populate("categoryId", "name color")
    .sort({ createdAt: -1 });

  res.json(sets);
};

exports.generateFlashcards = async (req, res) => {
  const { materialId, categoryId, difficulty, cardsPerTopic } = req.body;

  let title = "Generated Flashcards";
  let material = null;
  let category = null;

  if (materialId) {
    material = await Material.findOne({ _id: materialId, userId: req.user._id });
    if (!material) return res.status(404).json({ message: "Material not found" });
    title = material.title.replace(/\.[^/.]+$/, "");
  }

  if (categoryId) {
    category = await Category.findOne({ _id: categoryId, userId: req.user._id });
    if (!category) return res.status(404).json({ message: "Category not found" });
    title = `${category.name} - ${title}`;
  }

  const set = await FlashcardSet.create({
    userId: req.user._id,
    materialId: material?._id || null,
    categoryId: category?._id || null,
    title,
    cards: makeSampleCards(title, difficulty, cardsPerTopic),
  });

  res.status(201).json(set);
};

exports.updateCardReview = async (req, res) => {
  const { cardId, result } = req.body;

  const set = await FlashcardSet.findOne({ _id: req.params.setId, userId: req.user._id });
  if (!set) return res.status(404).json({ message: "Flashcard set not found" });

  const card = set.cards.id(cardId);
  if (!card) return res.status(404).json({ message: "Card not found" });

  card.reviewed = true;
  card.correct = result === "correct" || result === "known" || result === true;
  await set.save();

  const progress = await Progress.findOneAndUpdate(
    { userId: req.user._id, date: todayKey() },
    {
      $inc: {
        cardsReviewed: 1,
        correctCards: card.correct ? 1 : 0,
      },
      $setOnInsert: {
        totalTasks: 0,
        tasksCompleted: 0,
        studyStreak: 1,
        focusMinutes: 0,
      },
    },
    { new: true, upsert: true }
  );

  res.json({ set, progress });
};

exports.deleteFlashcardSet = async (req, res) => {
  const set = await FlashcardSet.findOneAndDelete({ _id: req.params.setId, userId: req.user._id });
  if (!set) return res.status(404).json({ message: "Flashcard set not found" });
  res.json({ message: "Flashcard set deleted" });
};
