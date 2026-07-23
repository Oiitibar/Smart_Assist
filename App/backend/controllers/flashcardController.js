const FlashcardSet = require("../models/FlashcardSet");
const Material = require("../models/Material");
const Category = require("../models/Category");
const Progress = require("../models/Progress");
const User = require("../models/User");
const { extractMaterialText } = require("../services/documentTextService");
const { generateFlashcardsWithAI } = require("../services/aiProviderService");

const todayKey = () => new Date().toISOString().slice(0, 10);


exports.getFlashcardSets = async (req, res) => {
  const sets = await FlashcardSet.find({ userId: req.user._id })
    .populate("materialId", "title fileType")
    .populate("categoryId", "name color soft emoji")
    .sort({ createdAt: -1 });

  return res.json(sets);
};

exports.generateFlashcards = async (req, res) => {
  const {
    materialId,
    categoryId,
    cardCount,
    cardsPerTopic,
    language,
  } = req.body;

  const requestedCount = Number(cardCount ?? cardsPerTopic);

  if (!materialId || !categoryId) {
    return res.status(400).json({
      message: "Material and category are required for flashcard generation",
    });
  }

  if (![3, 5, 10].includes(requestedCount)) {
    return res.status(400).json({
      message: "Card count must be 3, 5, or 10",
    });
  }

  const [material, category] = await Promise.all([
    Material.findOne({ _id: materialId, userId: req.user._id }),
    Category.findOne({ _id: categoryId, userId: req.user._id }),
  ]);

  if (!material) return res.status(404).json({ message: "Material not found" });
  if (!category) return res.status(404).json({ message: "Category not found" });

  if (material.categoryId && String(material.categoryId) !== String(category._id)) {
    return res.status(400).json({
      message: "The selected material is not in this category",
    });
  }

  const parsed = await extractMaterialText(material);
  const generated = await generateFlashcardsWithAI({
    sourceText: parsed.text,
    materialTitle: material.title,
    categoryName: category.name,
    cardCount: requestedCount,
    language: language || "Same as material",
  });

  const set = await FlashcardSet.create({
    userId: req.user._id,
    materialId: material._id,
    categoryId: category._id,
    title: `${category.name} - ${material.title.replace(/\.[^/.]+$/, "")}`,
    sourceType: "ai",
    generationMode: "provider",
    generation: {
      provider: generated.provider,
      model: generated.model,
      requestedCardCount: requestedCount,
      sourceFormat: parsed.extension.replace(/^\./, "").toUpperCase(),
      sourceTextLength: parsed.originalLength,
      sourceTextTruncated: parsed.truncated,
      generatedAt: new Date(),
    },
    cards: generated.cards,
  });

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "studyData.flashcardsCreated": set.cards.length },
  });

  await set.populate([
    { path: "materialId", select: "title fileType" },
    { path: "categoryId", select: "name color soft emoji" },
  ]);

  return res.status(201).json({
    ...set.toObject(),
    aiProvider: generated.provider,
    aiModel: generated.model,
    message: `${set.cards.length} flashcards generated with ${generated.provider}`,
  });
};

exports.createManualFlashcard = async (req, res) => {
  const { categoryId, question, answer, title } = req.body;

  if (!categoryId || !String(question || "").trim() || !String(answer || "").trim()) {
    return res.status(400).json({
      message: "Category, question and answer are required",
    });
  }

  const category = await Category.findOne({
    _id: categoryId,
    userId: req.user._id,
  });
  if (!category) return res.status(404).json({ message: "Category not found" });

  const set = await FlashcardSet.create({
    userId: req.user._id,
    categoryId: category._id,
    materialId: null,
    title: title || `${category.name} Manual Card`,
    sourceType: "manual",
    generationMode: "manual",
    cards: [{
      question: String(question).trim(),
      answer: String(answer).trim(),
      difficulty: "Medium",
    }],
  });

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "studyData.flashcardsCreated": 1 },
  });

  await set.populate("categoryId", "name color soft emoji");
  return res.status(201).json(set);
};

exports.updateCardReview = async (req, res) => {
  const { cardId, result } = req.body;
  const set = await FlashcardSet.findOne({
    _id: req.params.setId,
    userId: req.user._id,
  });

  if (!set) return res.status(404).json({ message: "Flashcard set not found" });

  const card = set.cards.id(cardId);
  if (!card) return res.status(404).json({ message: "Card not found" });

  const correct = result === "correct" || result === "known" || result === true;
  card.reviewed = true;
  card.correct = correct;
  card.lastReviewedAt = new Date();
  await set.save();

  const progress = await Progress.findOneAndUpdate(
    { userId: req.user._id, date: todayKey() },
    {
      $inc: {
        cardsReviewed: 1,
        correctCards: correct ? 1 : 0,
      },
      $setOnInsert: {
        totalTasks: 0,
        tasksCompleted: 0,
        studyStreak: 1,
        focusMinutes: 0,
      },
    },
    { new: true, upsert: true },
  );

  return res.json({ set, progress });
};

exports.deleteFlashcard = async (req, res) => {
  const { setId, cardId } = req.params;

  const set = await FlashcardSet.findOne({
    _id: setId,
    userId: req.user._id,
  });

  if (!set) {
    return res.status(404).json({ message: "Flashcard set not found" });
  }

  const card = set.cards.id(cardId);

  if (!card) {
    return res.status(404).json({ message: "Flashcard not found" });
  }

  const wasLastCard = set.cards.length === 1;

  if (wasLastCard) {
    await set.deleteOne();
  } else {
    set.cards.pull(cardId);
    await set.save();
  }

  await User.updateOne(
    {
      _id: req.user._id,
      "studyData.flashcardsCreated": { $gt: 0 },
    },
    {
      $inc: { "studyData.flashcardsCreated": -1 },
    },
  );

  return res.json({
    message: wasLastCard
      ? "Flashcard deleted and empty set removed"
      : "Flashcard deleted",
    cardId,
    setId,
    setDeleted: wasLastCard,
  });
};

exports.deleteFlashcardSet = async (req, res) => {
  const set = await FlashcardSet.findOneAndDelete({
    _id: req.params.setId,
    userId: req.user._id,
  });

  if (!set) return res.status(404).json({ message: "Flashcard set not found" });
  return res.json({ message: "Flashcard set deleted" });
};
