// Super-admin accounts are assigned only from this source-code allowlist.
// Replace the example email with the account email(s) that should own the
// highest platform role. Normal admins cannot add or remove super admins.
const SUPER_ADMIN_EMAILS = Object.freeze([
  "oiitibar1@gmail.com",
]);

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const normalizedSuperAdminEmails = new Set(
  SUPER_ADMIN_EMAILS.map(normalizeEmail).filter(Boolean),
);

const isSourceSuperAdmin = (email) =>
  normalizedSuperAdminEmails.has(normalizeEmail(email));

module.exports = {
  SUPER_ADMIN_EMAILS,
  isSourceSuperAdmin,
};
