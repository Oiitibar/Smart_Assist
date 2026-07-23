const Material = require("../models/Material");
const { extractMaterialText } = require("../services/documentTextService");
const { answerDocumentQuestion } = require("../services/documentAiService");
const { ensureMaterialPreview } = require("../services/documentPreviewService");

exports.viewMaterial = async (req, res) => {
  const material = await Material.findOne({
    _id: req.params.materialId,
    userId: req.user._id,
  });

  if (!material) {
    return res.status(404).json({ message: "Material not found" });
  }

  const preview = await ensureMaterialPreview(material);
  const previewName = `${String(material.title || material.originalName || "material")
    .replace(/[\\/:*?"<>|]/g, "-")}.pdf`;

  res.setHeader("Content-Type", preview.contentType);
  res.setHeader(
    "Content-Disposition",
    `inline; filename*=UTF-8''${encodeURIComponent(previewName)}`,
  );
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  return res.sendFile(preview.filePath);
};

exports.askMaterial = async (req, res) => {
  const {
    action = "question",
    question = "",
    selectedText = "",
    pageNumber = null,
    scope = "document",
  } = req.body;

  const allowedActions = new Set([
    "question",
    "explain",
    "summarize",
    "simplify",
    "example",
    "quiz",
  ]);

  if (!allowedActions.has(action)) {
    return res.status(400).json({ message: "Unsupported study action" });
  }

  const material = await Material.findOne({
    _id: req.params.materialId,
    userId: req.user._id,
  });

  if (!material) {
    return res.status(404).json({ message: "Material not found" });
  }

  const cleanQuestion = String(question || "").trim().slice(0, 2_000);
  const cleanSelection = String(selectedText || "").trim().slice(0, 12_000);

  if (action === "question" && !cleanQuestion) {
    return res.status(400).json({ message: "Question is required" });
  }

  const parsed = cleanSelection
    ? { text: cleanSelection, truncated: false }
    : await extractMaterialText(material);

  const result = await answerDocumentQuestion({
    action,
    question: cleanQuestion,
    sourceText: parsed.text,
    materialTitle: material.title,
    pageNumber,
    scope,
  });

  return res.json({
    answer: result.answer,
    provider: result.provider,
    model: result.model,
    sources: [
      {
        title: material.title,
        pageNumber: Number(pageNumber) || null,
      },
    ],
  });
};
