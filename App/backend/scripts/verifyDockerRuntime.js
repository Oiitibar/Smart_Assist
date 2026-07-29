const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const backendDirectory = path.resolve(__dirname, "..");
const requiredEnvironment = [
  "MONGO_URI",
  "JWT_SECRET",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
];

const checkWritableDirectory = async (directory) => {
  await fs.promises.mkdir(directory, { recursive: true });
  const testPath = path.join(
    directory,
    `.docker-write-test-${process.pid}-${Date.now()}`
  );

  await fs.promises.writeFile(testPath, "ok");
  await fs.promises.unlink(testPath);
};

const run = async () => {
  console.log(`Node: ${process.version}`);
  console.log(`Platform: ${process.platform}/${process.arch}`);

  const missing = requiredEnvironment.filter(
    (name) => !String(process.env[name] || "").trim()
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing runtime environment variables: ${missing.join(", ")}`
    );
  }

  const libreOfficePath =
    String(process.env.LIBREOFFICE_PATH || "").trim() ||
    "/usr/bin/soffice";

  if (!fs.existsSync(libreOfficePath)) {
    throw new Error(
      `LibreOffice executable was not found at ${libreOfficePath}`
    );
  }

  const { stdout, stderr } = await execFileAsync(
    libreOfficePath,
    ["--version"],
    { timeout: 15000 }
  );

  console.log(
    `LibreOffice: ${String(stdout || stderr).trim()}`
  );

  await checkWritableDirectory(
    path.join(backendDirectory, "previews")
  );
  await checkWritableDirectory(
    path.join(backendDirectory, "uploads", "avatars")
  );
  await checkWritableDirectory(os.tmpdir());

  console.log("Writable preview, avatar and temp directories: OK");
  console.log("Docker runtime verification passed.");
};

run().catch((error) => {
  console.error(`Docker runtime verification failed: ${error.message}`);
  process.exit(1);
});
