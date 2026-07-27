const configuredApiBase =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const apiOrigin = configuredApiBase
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

export function resolveAvatarUrl(avatarUrl) {
  const value = String(avatarUrl || "").trim();
  if (!value) return "";

  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `${apiOrigin}${normalizedPath}`;
}
