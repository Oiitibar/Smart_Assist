import api, { unwrap } from "./axios";

export const getFlashcardSets = async () => {
  const response = await api.get("/flashcards");
  return unwrap(response);
};

export const generateFlashcards = async ({ materialId, categoryId, difficulty, cardsPerTopic }) => {
  const response = await api.post("/flashcards/generate", {
    materialId,
    categoryId,
    difficulty,
    cardsPerTopic,
  });
  return unwrap(response);
};

export const updateCardReview = async (setId, cardId, result) => {
  const response = await api.put(`/flashcards/${setId}/review`, { cardId, result });
  return unwrap(response);
};

export const deleteFlashcardSet = async (id) => {
  const response = await api.delete(`/flashcards/${id}`);
  return unwrap(response);
};
