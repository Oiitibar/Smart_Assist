const QuizSet = require("../models/QuizSet");
const Material = require("../models/Material");
const Category = require("../models/Category");
const { extractMaterialText } = require("../services/documentTextService");
const { generateQuizWithAI } = require("../services/quizAiService");

const chooseQuestionCount = (textLength) => {
  const length = Number(textLength) || 0;
  if (length < 4_000) return 5;
  if (length < 12_000) return 8;
  if (length < 25_000) return 10;
  return 15;
};

const sanitizeQuizForStudent = (set) => {
  const value = set.toObject ? set.toObject() : set;
  return {
    ...value,
    questions: (value.questions || []).map((question) => ({
      _id: question._id,
      question: question.question,
      options: question.options,
      sourceReference: question.sourceReference,
    })),
  };
};

exports.getQuizSets = async (req, res) => {
  const sets = await QuizSet.find({ userId: req.user._id })
    .populate("materialId", "title fileType")
    .populate("categoryId", "name color soft emoji")
    .sort({ createdAt: -1 });

  return res.json(sets.map(sanitizeQuizForStudent));
};

exports.generateQuiz = async (req, res) => {
  const { materialId, categoryId, language } = req.body;

  if (!materialId || !categoryId) {
    return res.status(400).json({
      message: "Material and category are required for quiz generation",
    });
  }

  const [material, category] = await Promise.all([
    Material.findOne({ _id: materialId, userId: req.user._id }),
    Category.findOne({ _id: categoryId, userId: req.user._id }),
  ]);

  if (!material) return res.status(404).json({ message: "Material not found" });
  if (!category) return res.status(404).json({ message: "Category not found" });

  if (String(material.categoryId || "") !== String(category._id)) {
    return res.status(400).json({
      message: "The selected material is not in this category",
    });
  }

  const parsed = await extractMaterialText(material);
  const questionCount = chooseQuestionCount(parsed.originalLength);
  const generated = await generateQuizWithAI({
    sourceText: parsed.text,
    materialTitle: material.title,
    categoryName: category.name,
    questionCount,
    language: language || "Same as material",
  });

  const set = await QuizSet.create({
    userId: req.user._id,
    materialId: material._id,
    categoryId: category._id,
    title: `${material.title.replace(/\.[^/.]+$/, "")} Quiz`,
    generation: {
      provider: generated.provider,
      model: generated.model,
      questionCount,
      sourceFormat: parsed.extension.replace(/^\./, "").toUpperCase(),
      sourceTextLength: parsed.originalLength,
      sourceTextTruncated: parsed.truncated,
      generatedAt: new Date(),
    },
    questions: generated.questions,
  });

  await set.populate([
    { path: "materialId", select: "title fileType" },
    { path: "categoryId", select: "name color soft emoji" },
  ]);

  return res.status(201).json({
    ...sanitizeQuizForStudent(set),
    aiProvider: generated.provider,
    aiModel: generated.model,
    message: `${questionCount} quiz questions generated with ${generated.provider}`,
  });
};

exports.submitAttempt = async (req, res) => {
  const set = await QuizSet.findOne({
    _id: req.params.setId,
    userId: req.user._id,
  });

  if (!set) return res.status(404).json({ message: "Quiz set not found" });

  const submittedAnswers = Array.isArray(req.body.answers) ? req.body.answers : [];
  if (submittedAnswers.length !== set.questions.length) {
    return res.status(400).json({
      message: "Answer every question before submitting the quiz",
    });
  }

  const answerMap = new Map(
    submittedAnswers.map((answer) => [
      String(answer.questionId || ""),
      Number(answer.selectedOptionIndex),
    ]),
  );

  let score = 0;
  const answers = set.questions.map((question) => {
    const selectedOptionIndex = answerMap.get(String(question._id));
    if (!Number.isInteger(selectedOptionIndex) || selectedOptionIndex < 0 || selectedOptionIndex > 3) {
      const error = new Error("Every quiz answer must select one valid option");
      error.status = 400;
      throw error;
    }

    const correct = selectedOptionIndex === question.correctOptionIndex;
    if (correct) score += 1;

    return {
      questionId: question._id,
      selectedOptionIndex,
      correct,
    };
  });

  set.attempts.push({
    answers,
    score,
    total: set.questions.length,
    completedAt: new Date(),
  });
  await set.save();

  const review = set.questions.map((question) => ({
    questionId: question._id,
    correctOptionIndex: question.correctOptionIndex,
    explanation: question.explanation,
  }));

  return res.status(201).json({
    score,
    total: set.questions.length,
    percentage: Math.round((score / set.questions.length) * 100),
    review,
    completedAt: set.attempts[set.attempts.length - 1].completedAt,
  });
};

exports.deleteQuizSet = async (req, res) => {
  const set = await QuizSet.findOneAndDelete({
    _id: req.params.setId,
    userId: req.user._id,
  });

  if (!set) return res.status(404).json({ message: "Quiz set not found" });
  return res.json({ message: "Quiz set deleted", setId: String(set._id) });
};
