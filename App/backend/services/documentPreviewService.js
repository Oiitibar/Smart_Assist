const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { execFile } = require("child_process");
const { promisify } = require("util");
const { pathToFileURL } = require("url");
const {
  downloadObjectToTemp,
  isR2Material,
} = require("./r2StorageService");

const execFileAsync = promisify(execFile);

const backendDirectory = path.resolve(__dirname, "..");
const uploadsDirectory = path.join(backendDirectory, "uploads");
const materialUploadsDirectory = path.join(uploadsDirectory, "materials");
const previewsDirectory = path.join(backendDirectory, "previews");
const conversionLocks = new Map();

const SUPPORTED_PREVIEW_EXTENSIONS = new Set([".pdf", ".docx", ".pptx"]);
const CONVERTIBLE_EXTENSIONS = new Set([".docx", ".pptx"]);

const ensureDirectory = async (directory) => {
  await fs.promises.mkdir(directory, { recursive: true });
};

const createHttpError = (message, status = 500, code = "PREVIEW_ERROR") => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
};

const resolveStoredMaterialPath = (material) => {
  if (isR2Material(material)) {
    throw createHttpError(
      "R2 materials must be downloaded through the storage service",
      500,
      "R2_LOCAL_PATH_REQUESTED",
    );
  }

  const storedName =
    material?.storedName || path.basename(String(material?.fileUrl || ""));
  const safeName = path.basename(String(storedName || ""));
  const preferredPath = path.resolve(materialUploadsDirectory, safeName);
  const legacyPath = path.resolve(uploadsDirectory, safeName);

  if (
    !safeName ||
    !preferredPath.startsWith(`${materialUploadsDirectory}${path.sep}`)
  ) {
    throw createHttpError("Invalid material file path", 400, "INVALID_MATERIAL_PATH");
  }

  return fs.existsSync(preferredPath) ? preferredPath : legacyPath;
};

const getMaterialExtension = (material, sourcePath = "") => {
  const candidates = [
    material?.originalName,
    material?.storedName,
    material?.title,
    sourcePath,
  ];

  for (const candidate of candidates) {
    const extension = path.extname(String(candidate || "")).toLowerCase();
    if (extension) return extension;
  }

  return "";
};

const findLibreOfficeExecutable = () => {
  const configured = String(process.env.LIBREOFFICE_PATH || "").trim();
  if (configured) return configured;

  const platformCandidates = {
    win32: [
      "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
      "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
    ],
    darwin: ["/Applications/LibreOffice.app/Contents/MacOS/soffice"],
    linux: ["/usr/bin/libreoffice", "/usr/bin/soffice", "/snap/bin/libreoffice"],
  };

  const existing = (platformCandidates[process.platform] || []).find((candidate) =>
    fs.existsSync(candidate),
  );

  if (existing) return existing;
  return process.platform === "win32" ? "soffice.exe" : "soffice";
};

const getPreviewPath = (materialId) =>
  path.join(previewsDirectory, `${String(materialId)}.pdf`);

const isNonEmptyFile = async (filePath) => {
  try {
    const stats = await fs.promises.stat(filePath);
    return stats.isFile() && stats.size > 0;
  } catch {
    return false;
  }
};

const isLocalPreviewCurrent = async (sourcePath, previewPath) => {
  try {
    const [sourceStats, previewStats] = await Promise.all([
      fs.promises.stat(sourcePath),
      fs.promises.stat(previewPath),
    ]);

    return previewStats.size > 0 && previewStats.mtimeMs >= sourceStats.mtimeMs;
  } catch {
    return false;
  }
};

const convertOfficeFileToPdf = async ({ sourcePath, previewPath, materialId }) => {
  const timeout = Math.max(
    15_000,
    Number(process.env.PREVIEW_CONVERSION_TIMEOUT_MS || 120_000),
  );

  const libreOfficeExecutable = findLibreOfficeExecutable();
  const operationId = `${String(materialId)}-${Date.now()}-${crypto
    .randomBytes(4)
    .toString("hex")}`;
  const workDirectory = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "smart-assist-preview-"),
  );
  const outputDirectory = path.join(workDirectory, "output");
  const profileDirectory = path.join(workDirectory, "profile");

  await Promise.all([
    ensureDirectory(outputDirectory),
    ensureDirectory(profileDirectory),
    ensureDirectory(previewsDirectory),
  ]);

  const profileUrl = pathToFileURL(profileDirectory).href;

  try {
    await execFileAsync(
      libreOfficeExecutable,
      [
        `-env:UserInstallation=${profileUrl}`,
        "--headless",
        "--convert-to",
        "pdf",
        "--outdir",
        outputDirectory,
        sourcePath,
      ],
      {
        timeout,
        windowsHide: true,
        maxBuffer: 2 * 1024 * 1024,
      },
    );

    const expectedName = `${path.basename(
      sourcePath,
      path.extname(sourcePath),
    )}.pdf`;
    const expectedPath = path.join(outputDirectory, expectedName);

    let convertedPath = expectedPath;
    if (!fs.existsSync(convertedPath)) {
      const generatedPdf = (await fs.promises.readdir(outputDirectory)).find((name) =>
        name.toLowerCase().endsWith(".pdf"),
      );
      if (generatedPdf) convertedPath = path.join(outputDirectory, generatedPdf);
    }

    if (!fs.existsSync(convertedPath)) {
      throw createHttpError(
        "LibreOffice did not create a PDF preview",
        500,
        "PREVIEW_NOT_CREATED",
      );
    }

    const tempDestination = `${previewPath}.${operationId}.tmp`;
    await fs.promises.copyFile(convertedPath, tempDestination);
    await fs.promises.rename(tempDestination, previewPath).catch(async (error) => {
      if (error.code !== "EEXIST" && error.code !== "EPERM") throw error;
      await fs.promises.unlink(previewPath).catch(() => {});
      await fs.promises.rename(tempDestination, previewPath);
    });

    return previewPath;
  } catch (error) {
    if (error.code === "ENOENT") {
      throw createHttpError(
        "LibreOffice was not found. Install LibreOffice and set LIBREOFFICE_PATH in backend/.env.",
        503,
        "LIBREOFFICE_NOT_FOUND",
      );
    }

    if (error.killed || error.signal || error.code === "ETIMEDOUT") {
      throw createHttpError(
        "Document preview conversion timed out",
        504,
        "PREVIEW_TIMEOUT",
      );
    }

    if (error.status) throw error;

    throw createHttpError(
      `Could not convert this document to PDF: ${error.message}`,
      500,
      "PREVIEW_CONVERSION_FAILED",
    );
  } finally {
    await fs.promises.rm(workDirectory, { recursive: true, force: true }).catch(() => {});
  }
};

const ensureR2MaterialPreview = async (material, extension) => {
  if (extension === ".pdf") {
    const temporary = await downloadObjectToTemp({
      key: material.storageKey,
      originalName: material.originalName || material.storedName,
    });

    return {
      filePath: temporary.filePath,
      contentType: "application/pdf",
      converted: false,
      temporary: true,
      cleanup: temporary.cleanup,
    };
  }

  const materialId = String(material._id || material.id);
  const previewPath = getPreviewPath(materialId);
  await ensureDirectory(previewsDirectory);

  // The material object key never changes in this project. A non-empty local
  // preview is therefore a valid cache until the material is deleted. Render
  // may erase it during restart/redeploy, in which case it is regenerated.
  if (await isNonEmptyFile(previewPath)) {
    return {
      filePath: previewPath,
      contentType: "application/pdf",
      converted: true,
      temporary: true,
    };
  }

  if (!conversionLocks.has(materialId)) {
    conversionLocks.set(
      materialId,
      (async () => {
        const temporary = await downloadObjectToTemp({
          key: material.storageKey,
          originalName: material.originalName || material.storedName,
        });

        try {
          await convertOfficeFileToPdf({
            sourcePath: temporary.filePath,
            previewPath,
            materialId,
          });
        } finally {
          await temporary.cleanup();
        }
      })().finally(() => conversionLocks.delete(materialId)),
    );
  }

  await conversionLocks.get(materialId);

  return {
    filePath: previewPath,
    contentType: "application/pdf",
    converted: true,
    temporary: true,
  };
};

const ensureMaterialPreview = async (material) => {
  const extension = getMaterialExtension(material);

  if (!SUPPORTED_PREVIEW_EXTENSIONS.has(extension)) {
    throw createHttpError(
      "Preview is supported only for PDF, DOCX and PPTX files",
      415,
      "UNSUPPORTED_PREVIEW_TYPE",
    );
  }

  if (isR2Material(material)) {
    return ensureR2MaterialPreview(material, extension);
  }

  const sourcePath = resolveStoredMaterialPath(material);

  if (!fs.existsSync(sourcePath)) {
    throw createHttpError("Material file not found", 404, "MATERIAL_FILE_NOT_FOUND");
  }

  if (extension === ".pdf") {
    return {
      filePath: sourcePath,
      contentType: "application/pdf",
      converted: false,
    };
  }

  if (!CONVERTIBLE_EXTENSIONS.has(extension)) {
    throw createHttpError("This document cannot be converted", 415);
  }

  await ensureDirectory(previewsDirectory);
  const materialId = String(material._id || material.id);
  const previewPath = getPreviewPath(materialId);

  if (await isLocalPreviewCurrent(sourcePath, previewPath)) {
    return {
      filePath: previewPath,
      contentType: "application/pdf",
      converted: true,
    };
  }

  if (!conversionLocks.has(materialId)) {
    conversionLocks.set(
      materialId,
      convertOfficeFileToPdf({ sourcePath, previewPath, materialId }).finally(() =>
        conversionLocks.delete(materialId),
      ),
    );
  }

  await conversionLocks.get(materialId);

  return {
    filePath: previewPath,
    contentType: "application/pdf",
    converted: true,
  };
};

const deleteMaterialPreview = async (materialId) => {
  if (!materialId) return;
  const previewPath = getPreviewPath(String(materialId));
  await fs.promises.unlink(previewPath).catch(() => {});
};

module.exports = {
  ensureMaterialPreview,
  deleteMaterialPreview,
  resolveStoredMaterialPath,
};
