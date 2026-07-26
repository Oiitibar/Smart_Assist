const { buildQuizMessages } = require("../utils/quizPrompt");

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const parseJsonContent = (content) => {
  let value = content;

  if (Array.isArray(value)) {
    value = value
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .join("");
  }

  let text = String(value || "").trim();
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("The AI provider returned invalid quiz JSON");
  }
};

const cleanQuestions = (payload, questionCount) => {
  const sourceQuestions = Array.isArray(payload?.questions)
    ? payload.questions
    : [];
  const seen = new Set();
  const questions = [];

  for (const item of sourceQuestions) {
    const question = String(item?.question || "").trim().slice(0, 600);
    const rawOptions = Array.isArray(item?.options) ? item.options : [];
    const options = rawOptions
      .slice(0, 4)
      .map((option) => String(option || "").trim().slice(0, 500));
    const correctOptionIndex = Number(item?.correctOptionIndex);
    const explanation = String(item?.explanation || "").trim().slice(0, 1_500);
    const sourceReference = String(item?.sourceReference || "")
      .trim()
      .slice(0, 300);
    const key = question.toLowerCase().replace(/\s+/g, " ");

    if (
      question.length < 8 ||
      options.length !== 4 ||
      options.some((option) => option.length < 1) ||
      new Set(options.map((option) => option.toLowerCase())).size !== 4 ||
      !Number.isInteger(correctOptionIndex) ||
      correctOptionIndex < 0 ||
      correctOptionIndex > 3 ||
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);
    questions.push({
      question,
      options,
      correctOptionIndex,
      explanation,
      sourceReference,
    });

    if (questions.length === questionCount) break;
  }

  if (questions.length !== questionCount) {
    throw new Error(
      `The AI returned ${questions.length} valid quiz questions instead of ${questionCount}`,
    );
  }

  return questions;
};

const requestJson = async ({ url, headers, body }) => {
  const controller = new AbortController();
  const timeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS) || 45_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const responseText = await response.text();
    let data = {};
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {}

    if (!response.ok) {
      const message =
        data?.error?.message ||
        data?.message ||
        `Provider request failed with status ${response.status}`;
      const error = new Error(String(message).slice(0, 300));
      error.providerStatus = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Provider request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

const providerOrder = () =>
  [...new Set(
    String(process.env.AI_PROVIDER_ORDER || "openrouter,groq")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  )].filter((name) => ["openrouter", "groq"].includes(name));

const callOpenRouter = async ({ messages, questionCount }) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "X-Title": process.env.OPENROUTER_APP_NAME || "Smart Assist",
  };
  if (process.env.APP_PUBLIC_URL) {
    headers["HTTP-Referer"] = process.env.APP_PUBLIC_URL;
  }

  const data = await requestJson({
    url: "https://openrouter.ai/api/v1/chat/completions",
    headers,
    body: {
      model,
      messages,
      temperature: 0.2,
      max_tokens: Math.max(1_800, questionCount * 420),
      response_format: { type: "json_object" },
    },
  });

  return {
    provider: "openrouter",
    model: data?.model || model,
    content: data?.choices?.[0]?.message?.content,
  };
};

const callGroq = async ({ messages, questionCount }) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const data = await requestJson({
    url: "https://api.groq.com/openai/v1/chat/completions",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: {
      model,
      messages,
      temperature: 0.2,
      max_completion_tokens: Math.max(1_800, questionCount * 420),
      response_format: { type: "json_object" },
    },
  });

  return {
    provider: "groq",
    model: data?.model || model,
    content: data?.choices?.[0]?.message?.content,
  };
};

const generateQuizWithAI = async ({
  sourceText,
  materialTitle,
  categoryName,
  questionCount,
  language,
}) => {
  if (!process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY) {
    throw createHttpError(
      503,
      "AI is not configured. Add OPENROUTER_API_KEY or GROQ_API_KEY to backend/.env.",
    );
  }

  const messages = buildQuizMessages({
    sourceText,
    materialTitle,
    categoryName,
    questionCount,
    language,
  });
  const failures = [];

  for (const provider of providerOrder()) {
    if (provider === "openrouter" && !process.env.OPENROUTER_API_KEY) continue;
    if (provider === "groq" && !process.env.GROQ_API_KEY) continue;

    try {
      const result = provider === "openrouter"
        ? await callOpenRouter({ messages, questionCount })
        : await callGroq({ messages, questionCount });
      const payload = parseJsonContent(result.content);
      const questions = cleanQuestions(payload, questionCount);

      return {
        questions,
        provider: result.provider,
        model: result.model,
      };
    } catch (error) {
      failures.push({
        provider,
        status: error?.providerStatus || null,
        message: String(error?.message || "Provider failed").slice(0, 240),
      });
    }
  }

  console.error("AI quiz providers failed:", failures);
  throw createHttpError(
    502,
    "Quiz generation failed with all configured AI providers.",
  );
};

module.exports = { generateQuizWithAI };
