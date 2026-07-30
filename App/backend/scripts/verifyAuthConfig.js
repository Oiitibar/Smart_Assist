require("dotenv").config();

const jwt = require("jsonwebtoken");

const required = ["JWT_SECRET"];
const missing = required.filter(
  (name) => !String(process.env[name] || "").trim(),
);

if (missing.length > 0) {
  console.error(`Missing required variable(s): ${missing.join(", ")}`);
  process.exit(1);
}

const secret = process.env.JWT_SECRET;
const sample = jwt.sign(
  { id: "auth-config-test" },
  secret,
  { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
);
const decoded = jwt.verify(sample, secret);

if (decoded.id !== "auth-config-test") {
  console.error("JWT sign/verify test failed.");
  process.exit(1);
}

console.log("JWT sign/verify: OK");
console.log(`NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
console.log(
  `JWT_COOKIE_NAME: ${process.env.JWT_COOKIE_NAME || "study_jwt (default)"}`,
);
console.log(
  `JWT_COOKIE_PARTITIONED: ${process.env.JWT_COOKIE_PARTITIONED || "false"}`,
);
console.log(`JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN || "7d"}`);
console.log("Auth transport: HttpOnly cookie + Bearer fallback");
