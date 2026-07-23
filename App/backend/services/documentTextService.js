const fs = require("fs/promises");
const path = require("path");

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const uploadsDirectory = path.resolve(__dirname, "..", "uploads");

const getMaterialExtension = (material) => {
  const value =
    material.originalName ||
    material.storedName ||
    material.fileUrl ||
    material.title ||
    "";

  return path.extname(String(value)).toLowerCase();
};

const resolveMaterialPath = (material) => {
  const storedName =
    material.storedName ||
    path.basename(String(material.fileUrl || ""));

  if (!storedName) {
    throw createHttpError(404, "The stored material file could not be located");
  }

  // basename prevents a database value from escaping backend/uploads.
  const safeName = path.basename(storedName);
  const filePath = path.resolve(uploadsDirectory, safeName);

  if (!filePath.startsWith(`${uploadsDirectory}${path.sep}`)) {
    throw createHttpError(400, "Invalid material file path");
  }

  return filePath;
};

const normalizeText = (value) =>
  String(value || "")
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();

const limitText = (text) => {
  const maxCharacters = Math.max(
    5_000,
    Math.min(Number(process.env.AI_MAX_INPUT_CHARS) || 60_000, 180_000),
  );

  if (text.length <= maxCharacters) {
    return { text, truncated: false, originalLength: text.length };
  }

  const marker = "\n\n[...middle section sampled for AI input...]\n\n";
  const usable = maxCharacters - marker.length;
  const headLength = Math.floor(usable * 0.4);
  const middleLength = Math.floor(usable * 0.2);
  const tailLength = usable - headLength - middleLength;
  const middleStart = Math.max(0, Math.floor((text.length - middleLength) / 2));

  return {
    text:
      text.slice(0, headLength) +
      marker +
      text.slice(middleStart, middleStart + middleLength) +
      marker +
      text.slice(-tailLength),
    truncated: true,
    originalLength: text.length,
  };
};

const extractPdfText = async (buffer) => {
  const pdfModule = require("pdf-parse");

  // Supports the v1-compatible function API.
  if (typeof pdfModule === "function") {
    const result = await pdfModule(buffer);
    return result?.text || "";
  }

  // Supports pdf-parse v2.
  if (pdfModule?.PDFParse) {
    const parser = new pdfModule.PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result?.text || "";
    } finally {
      if (typeof parser.destroy === "function") {
        await parser.destroy();
      }
    }
  }

  throw createHttpError(500, "The PDF parser is not configured correctly");
};

const extractDocxText = async (filePath) => {
  const mammoth = require("mammoth");
  const result = await mammoth.extractRawText({ path: filePath });
  return result?.value || "";
};

const extractPptxText = async (filePath) => {
  const parsePptx = require("pptx-text-parser");
  return parsePptx(filePath, "text");
};

const extractMaterialText = async (material) => {
  const extension = getMaterialExtension(material);
  const filePath = resolveMaterialPath(material);
  const maximumBytes =
    Math.max(1, Number(process.env.AI_MAX_FILE_SIZE_MB) || 25) * 1024 * 1024;

  let stats;
  try {
    stats = await fs.stat(filePath);
  } catch {
    throw createHttpError(404, "The uploaded material file no longer exists on the server");
  }

  if (stats.size > maximumBytes) {
    throw createHttpError(
      413,
      `This material is too large for AI processing. Maximum: ${Math.round(maximumBytes / 1024 / 1024)} MB`,
    );
  }

  let extracted = "";

  if ([".txt", ".md", ".csv", ".json"].includes(extension)) {
    extracted = await fs.readFile(filePath, "utf8");
  } else if (extension === ".pdf") {
    extracted = await extractPdfText(await fs.readFile(filePath));
  } else if (extension === ".docx") {
    extracted = await extractDocxText(filePath);
  } else if (extension === ".pptx") {
    extracted = await extractPptxText(filePath);
  } else if ([".doc", ".ppt"].includes(extension)) {
    throw createHttpError(
      415,
      "Old DOC and PPT files are not supported for AI generation. Convert the file to DOCX, PPTX, PDF, or TXT first.",
    );
  } else if ([".png", ".jpg", ".jpeg", ".webp"].includes(extension)) {
    throw createHttpError(
      415,
      "Image OCR is not included in this AI version. Convert the image to a text-based PDF or TXT file first.",
    );
  } else {
    throw createHttpError(
      415,
      "AI generation currently supports PDF, DOCX, PPTX, TXT, MD, CSV, and JSON materials.",
    );
  }

  const normalized = normalizeText(extracted);

  if (normalized.length < 120) {
    throw createHttpError(
      422,
      extension === ".pdf"
        ? "The PDF contains too little extractable text. It may be scanned and require OCR."
        : "The material contains too little text to create useful flashcards.",
    );
  }

  const limited = limitText(normalized);

  return {
    ...limited,
    extension,
    storedPath: filePath,
    fileSize: stats.size,
  };
};

module.exports = { extractMaterialText };
