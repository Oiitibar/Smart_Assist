const { buildFlashcardMessages } = require("../utils/flashcardPrompt");

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
    throw new Error("The AI provider returned invalid JSON");
  }
};

const cleanCards = (payload, cardCount) => {
  const sourceCards = Array.isArray(payload?.cards) ? payload.cards : [];
  const seenQuestions = new Set();
  const cards = [];

  for (const card of sourceCards) {
    const question = String(card?.question || "").trim().slice(0, 500);
    const answer = String(card?.answer || "").trim().slice(0, 2_000);
    const sourceReference = String(card?.sourceReference || "").trim().slice(0, 300);
    const key = question.toLowerCase().replace(/\s+/g, " ");

    if (question.length < 5 || answer.length < 5 || seenQuestions.has(key)) {
      continue;
    }

    seenQuestions.add(key);
    cards.push({
      question,
      answer,
      sourceReference,
      difficulty: "Medium",
    });

    if (cards.length === cardCount) break;
  }

  if (cards.length !== cardCount) {
    throw new Error(`The AI returned ${cards.length} valid cards instead of ${cardCount}`);
  }

  return cards;
};

const requestJson = async ({ url, headers, body, timeoutMs }) => {
  if (typeof fetch !== "function") {
    throw new Error("Node.js 18 or newer is required for AI API requests");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const responseText = await response.text();
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = {};
    }

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

const callOpenRouter = async ({ messages, cardCount }) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";
  const headers = { Authorization: `Bearer ${apiKey}` };

  if (process.env.APP_PUBLIC_URL) {
    headers["HTTP-Referer"] = process.env.APP_PUBLIC_URL;
  }
  headers["X-Title"] = process.env.OPENROUTER_APP_NAME || "Smart Student Planner";

  const data = await requestJson({
    url: "https://openrouter.ai/api/v1/chat/completions",
    headers,
    timeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS) || 45_000,
    body: {
      model,
      messages,
      temperature: 0.2,
      max_tokens: Math.max(1_200, cardCount * 300),
      response_format: { type: "json_object" },
    },
  });

  return {
    provider: "openrouter",
    model: data?.model || model,
    content: data?.choices?.[0]?.message?.content,
  };
};

const callGroq = async ({ messages, cardCount }) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const data = await requestJson({
    url: "https://api.groq.com/openai/v1/chat/completions",
    headers: { Authorization: `Bearer ${apiKey}` },
    timeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS) || 45_000,
    body: {
      model,
      messages,
      temperature: 0.2,
      max_completion_tokens: Math.max(1_200, cardCount * 300),
      response_format: { type: "json_object" },
    },
  });

  return {
    provider: "groq",
    model: data?.model || model,
    content: data?.choices?.[0]?.message?.content,
  };
};

const providerOrder = () => {
  const configured = String(process.env.AI_PROVIDER_ORDER || "openrouter,groq")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return [...new Set(configured)].filter((name) => ["openrouter", "groq"].includes(name));
};

const generateFlashcardsWithAI = async ({
  sourceText,
  materialTitle,
  categoryName,
  cardCount,
  language,
}) => {
  if (!process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY) {
    throw createHttpError(
      503,
      "AI is not configured. Add OPENROUTER_API_KEY or GROQ_API_KEY to backend/.env.",
    );
  }

  const messages = buildFlashcardMessages({
    sourceText,
    materialTitle,
    categoryName,
    cardCount,
    language,
  });

  const failures = [];

  for (const provider of providerOrder()) {
    if (provider === "openrouter" && !process.env.OPENROUTER_API_KEY) continue;
    if (provider === "groq" && !process.env.GROQ_API_KEY) continue;

    try {
      const result = provider === "openrouter"
        ? await callOpenRouter({ messages, cardCount })
        : await callGroq({ messages, cardCount });

      const payload = parseJsonContent(result.content);
      const cards = cleanCards(payload, cardCount);

      return {
        cards,
        provider: result.provider,
        model: result.model,
      };
    } catch (error) {
      // Do not log API keys, prompts, source text, or full provider responses.
      failures.push({
        provider,
        status: error?.providerStatus || null,
        message: String(error?.message || "Provider failed").slice(0, 240),
      });
    }
  }

  console.error("AI flashcard providers failed:", failures);
  throw createHttpError(
    502,
    "Flashcard generation failed with both AI providers. Check the API keys, model names, provider limits, and extracted material text.",
  );
};

module.exports = { generateFlashcardsWithAI };
