require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Material = require("../models/Material");
const {
  createMaterialKey,
  deleteObject,
  objectExists,
  uploadBuffer,
} = require("../services/r2StorageService");

const backendDirectory = path.resolve(__dirname, "..");
const uploadsDirectory = path.join(backendDirectory, "uploads");
const materialUploadsDirectory = path.join(uploadsDirectory, "materials");

const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const readNumberOption = (name, fallback, minimum = 0, maximum = 100000) => {
  const prefix = `--${name}=`;
  const raw = args.find((item) => item.startsWith(prefix));
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw.slice(prefix.length), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
};

const dryRun = hasFlag("--dry-run");
const shouldDeleteLocal = hasFlag("--delete-local");
const limit = readNumberOption("limit", 0, 0, 100000);
const uploadAttempts = readNumberOption(
  "max-attempts",
  Number.parseInt(process.env.R2_MAX_ATTEMPTS || "5", 10) || 5,
  1,
  10,
);
const delayBetweenFilesMs = readNumberOption(
  "delay-ms",
  Number.parseInt(process.env.R2_MIGRATION_DELAY_MS || "1000", 10) || 1000,
  0,
  60000,
);

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const isTemporaryNetworkError = (error) => {
  const code = String(error?.code || error?.name || "").toUpperCase();
  const message = String(error?.message || "");

  return (
    [
      "ECONNRESET",
      "ETIMEDOUT",
      "ECONNREFUSED",
      "EAI_AGAIN",
      "ENETUNREACH",
      "NETWORKINGERROR",
      "TIMEOUTERROR",
    ].includes(code) ||
    /ECONNRESET|socket hang up|network|timeout|timed out|connection reset/i.test(
      message,
    )
  );
};

const findLocalFile = (storedName) => {
  const safeName = path.basename(String(storedName || ""));
  if (!safeName) return null;

  const candidates = [
    path.join(materialUploadsDirectory, safeName),
    path.join(uploadsDirectory, safeName), // legacy project layout
  ];

  return candidates.find((filePath) => fs.existsSync(filePath)) || null;
};

const removeLocalCopies = async (storedName) => {
  const safeName = path.basename(String(storedName || ""));
  if (!safeName) return;

  const candidates = [
    path.join(materialUploadsDirectory, safeName),
    path.join(uploadsDirectory, safeName),
  ];

  await Promise.all(
    candidates.map((filePath) =>
      fs.promises.unlink(filePath).catch((error) => {
        if (error?.code !== "ENOENT") throw error;
      }),
    ),
  );
};

const uploadWithRetry = async (options, maxAttempts = 5) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await uploadBuffer(options);

      if (!(await objectExists(options.key))) {
        throw new Error("R2 upload returned, but the object could not be verified");
      }

      return;
    } catch (error) {
      lastError = error;

      // A connection reset can happen after R2 accepted the upload but before
      // the response reached this computer. Check the key before retrying.
      try {
        if (await objectExists(options.key)) {
          console.warn(
            "Upload response was interrupted, but the R2 object exists. Continuing safely.",
          );
          return;
        }
      } catch {
        // Ignore verification failure here and use the normal retry decision.
      }

      const canRetry = isTemporaryNetworkError(error) && attempt < maxAttempts;
      if (!canRetry) throw error;

      const delay = Math.min(15000, attempt * 2000) + Math.floor(Math.random() * 500);
      console.warn(
        `Temporary upload error (${error.code || error.message}). ` +
          `Retrying in ${(delay / 1000).toFixed(1)}s ` +
          `(attempt ${attempt + 1}/${maxAttempts})...`,
      );
      await wait(delay);
    }
  }

  throw lastError;
};

const printSettings = () => {
  console.log("Migration settings:");
  console.log(`  Dry run: ${dryRun ? "yes" : "no"}`);
  console.log(`  Delete local after success: ${shouldDeleteLocal ? "yes" : "no"}`);
  console.log(`  Upload attempts per file: ${uploadAttempts}`);
  console.log(`  Delay between files: ${delayBetweenFilesMs}ms`);
  console.log(`  Limit: ${limit || "all"}`);
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from backend/.env");
  }

  printSettings();
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected.");

  let query = Material.find({
    $or: [
      { storageProvider: "local" },
      { storageProvider: { $exists: false } },
      { storageProvider: null },
    ],
  }).sort({ createdAt: 1, _id: 1 });

  if (limit > 0) query = query.limit(limit);

  const materials = await query;
  console.log(`Found ${materials.length} local material(s) to examine.`);

  const result = {
    examined: materials.length,
    migrated: 0,
    dryRun: 0,
    missing: 0,
    failed: 0,
  };

  for (let index = 0; index < materials.length; index += 1) {
    const material = materials[index];
    const label = `${index + 1}/${materials.length}`;
    const originalStoredName = material.storedName;
    const localPath = findLocalFile(originalStoredName);

    if (!localPath) {
      console.warn(`[MISSING ${label}] ${material.title} (${material._id})`);
      result.missing += 1;
      continue;
    }

    if (dryRun) {
      console.log(`[DRY RUN ${label}] ${material.title} -> ${localPath}`);
      result.dryRun += 1;
      continue;
    }

    const storageKey = createMaterialKey({
      userId: material.userId,
      originalName:
        material.originalName || material.storedName || material.title || "material",
    });

    let r2ObjectConfirmed = false;

    try {
      const buffer = await fs.promises.readFile(localPath);
      const stats = await fs.promises.stat(localPath);

      console.log(
        `[UPLOAD ${label}] ${material.title} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`,
      );

      await uploadWithRetry(
        {
          key: storageKey,
          buffer,
          contentType: material.mimeType || "application/octet-stream",
          metadata: {
            userid: String(material.userId),
            materialid: String(material._id),
            originalname: encodeURIComponent(
              material.originalName || material.storedName || material.title,
            ),
          },
        },
        uploadAttempts,
      );

      r2ObjectConfirmed = true;

      // Update the same MongoDB record so category, flashcards, quizzes, and
      // all references to material._id remain valid.
      material.storageProvider = "r2";
      material.storageKey = storageKey;
      material.storedName = path.basename(storageKey);
      material.fileUrl = `/private-materials/${encodeURIComponent(storageKey)}`;
      if (!material.size) material.size = stats.size;

      await material.save();

      if (shouldDeleteLocal) {
        await removeLocalCopies(originalStoredName);
      }

      console.log(`[MIGRATED ${label}] ${material.title} -> ${storageKey}`);
      result.migrated += 1;
    } catch (error) {
      result.failed += 1;

      // If R2 succeeded but MongoDB failed, remove the new object so there is
      // no orphaned cloud file. Never remove the original local file here.
      if (r2ObjectConfirmed) {
        await deleteObject(storageKey).catch(() => {});
      }

      console.error(
        `[FAILED ${label}] ${material.title}: ${error.code || "ERROR"} ${error.message}`,
      );
      // Intentionally continue with the remaining materials.
    }

    if (delayBetweenFilesMs > 0 && index < materials.length - 1) {
      await wait(delayBetweenFilesMs);
    }
  }

  console.log("\nMigration summary:");
  console.table(result);

  await mongoose.disconnect();

  if (result.failed > 0 || result.missing > 0) {
    process.exitCode = 1;
  }
};

run().catch(async (error) => {
  console.error("Migration stopped:", error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
