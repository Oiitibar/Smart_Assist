const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { pipeline } = require("stream/promises");
const {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const { getR2Client, getR2Config } = require("../config/r2Client");

const createHttpError = (message, status = 500, code = "R2_ERROR") => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
};

const safeFilename = (originalName = "material") => {
  const extension = path.extname(String(originalName)).toLowerCase();
  const base = path
    .basename(String(originalName), extension)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return `${base || "material"}${extension}`;
};

const createMaterialKey = ({ userId, originalName }) =>
  [
    "users",
    String(userId),
    "materials",
    `${crypto.randomUUID()}-${safeFilename(originalName)}`,
  ].join("/");

const uploadBuffer = async ({ key, buffer, contentType, metadata = {} }) => {
  if (!Buffer.isBuffer(buffer)) {
    throw createHttpError("The uploaded material buffer is missing", 400);
  }

  const { bucketName } = getR2Config();
  const result = await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType || "application/octet-stream",
      Metadata: Object.fromEntries(
        Object.entries(metadata).map(([name, value]) => [
          name,
          String(value || "").slice(0, 1_500),
        ]),
      ),
    }),
  );

  return {
    key,
    etag: result.ETag || "",
  };
};

const getObject = async (key) => {
  const { bucketName } = getR2Config();

  try {
    return await getR2Client().send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );
  } catch (error) {
    if (
      error?.name === "NoSuchKey" ||
      error?.$metadata?.httpStatusCode === 404
    ) {
      throw createHttpError(
        "The stored material no longer exists in Cloudflare R2",
        404,
        "R2_OBJECT_NOT_FOUND",
      );
    }

    throw error;
  }
};

const objectExists = async (key) => {
  const { bucketName } = getR2Config();

  try {
    await getR2Client().send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );
    return true;
  } catch (error) {
    if (
      error?.name === "NotFound" ||
      error?.name === "NoSuchKey" ||
      error?.$metadata?.httpStatusCode === 404
    ) {
      return false;
    }

    throw error;
  }
};

const deleteObject = async (key) => {
  if (!key) return;
  const { bucketName } = getR2Config();

  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
};

const downloadObjectToTemp = async ({ key, originalName }) => {
  if (!key) {
    throw createHttpError("The R2 storage key is missing", 500, "R2_KEY_MISSING");
  }

  const tempDirectory = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "smart-assist-r2-"),
  );
  const filePath = path.join(
    tempDirectory,
    safeFilename(originalName || path.basename(key)),
  );

  try {
    const object = await getObject(key);
    if (!object.Body) {
      throw createHttpError("Cloudflare R2 returned an empty file", 502);
    }

    await pipeline(object.Body, fs.createWriteStream(filePath));

    return {
      filePath,
      size: Number(object.ContentLength || 0),
      contentType: object.ContentType || "application/octet-stream",
      cleanup: async () => {
        await fs.promises.rm(tempDirectory, {
          recursive: true,
          force: true,
        });
      },
    };
  } catch (error) {
    await fs.promises.rm(tempDirectory, {
      recursive: true,
      force: true,
    });
    throw error;
  }
};

const isR2Material = (material) =>
  material?.storageProvider === "r2" && Boolean(material?.storageKey);

module.exports = {
  createMaterialKey,
  deleteObject,
  downloadObjectToTemp,
  getObject,
  isR2Material,
  objectExists,
  safeFilename,
  uploadBuffer,
};
