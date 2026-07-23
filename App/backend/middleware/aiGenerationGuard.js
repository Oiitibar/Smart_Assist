const activeRequests = new Set();
const requestHistory = new Map();

const aiGenerationGuard = (req, res, next) => {
  const userKey = String(req.user?._id || req.ip || "anonymous");
  const now = Date.now();
  const windowMs = Math.max(
    60_000,
    Number(process.env.AI_RATE_WINDOW_MS) || 60 * 60 * 1_000,
  );
  const maximumRequests = Math.max(
    1,
    Number(process.env.AI_RATE_MAX_REQUESTS) || 5,
  );

  const recent = (requestHistory.get(userKey) || []).filter(
    (timestamp) => now - timestamp < windowMs,
  );

  if (activeRequests.has(userKey)) {
    return res.status(409).json({
      message: "A flashcard generation request is already running for this account.",
    });
  }

  if (recent.length >= maximumRequests) {
    return res.status(429).json({
      message: "AI generation limit reached. Please try again later.",
    });
  }

  recent.push(now);
  requestHistory.set(userKey, recent);
  activeRequests.add(userKey);

  const release = () => activeRequests.delete(userKey);
  res.once("finish", release);
  res.once("close", release);

  return next();
};

module.exports = { aiGenerationGuard };
