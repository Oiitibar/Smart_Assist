const { S3Client } = require("@aws-sdk/client-s3");

const REQUIRED_R2_VARIABLES = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
];

let client;

const readPositiveInteger = (value, fallback, minimum = 1, maximum = 10) => {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
};

const getR2Config = () => {
  const missing = REQUIRED_R2_VARIABLES.filter(
    (name) => !String(process.env[name] || "").trim(),
  );

  if (missing.length > 0) {
    const error = new Error(
      `Missing Cloudflare R2 environment variables: ${missing.join(", ")}`,
    );
    error.status = 503;
    error.code = "R2_NOT_CONFIGURED";
    throw error;
  }

  const accountId = String(process.env.R2_ACCOUNT_ID).trim();

  return {
    bucketName: String(process.env.R2_BUCKET_NAME).trim(),
    endpoint:
      String(process.env.R2_ENDPOINT || "").trim() ||
      `https://${accountId}.r2.cloudflarestorage.com`,
    region: String(process.env.R2_REGION || "auto").trim() || "auto",
    maxAttempts: readPositiveInteger(process.env.R2_MAX_ATTEMPTS, 5),
    credentials: {
      accessKeyId: String(process.env.R2_ACCESS_KEY_ID).trim(),
      secretAccessKey: String(process.env.R2_SECRET_ACCESS_KEY).trim(),
    },
  };
};

const getR2Client = () => {
  if (client) return client;

  const config = getR2Config();
  client = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: config.credentials,

    // The AWS SDK retries temporary network failures, including many
    // ECONNRESET and timeout cases. Keep the value configurable because
    // unstable connections may need more attempts during migration.
    maxAttempts: config.maxAttempts,
    retryMode: "standard",
  });

  return client;
};

module.exports = {
  getR2Client,
  getR2Config,
};
