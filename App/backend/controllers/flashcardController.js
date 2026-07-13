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

exports.createManualFlashcard = async (req, res) => {
  try {
    const { categoryId, question, answer } = req.body;

    if (!categoryId || !question?.trim() || !answer?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category, question, and answer are required",
      });
    }

    const category = await Category.findOne({
      _id: categoryId,
      userId: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    let set = await FlashcardSet.findOne({
      userId: req.user._id,
      categoryId,
      sourceType: "manual",
    });

    if (!set) {
      set = await FlashcardSet.create({
        userId: req.user._id,
        categoryId,
        title: `${category.name} manual cards`,
        sourceType: "manual",
        cards: [],
      });
    }

    set.cards.push({
      question: question.trim(),
      answer: answer.trim(),
      known: false,
    });

    await set.save();
    return res.status(201).json({ success: true, data: set });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
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
