import api, { unwrap } from "./axios";

const requestData = async (request) => unwrap(await request);

export const plannerApi = {
  getDashboardSummary: () => requestData(api.get("/dashboard/summary")),

  getTimetable: () => requestData(api.get("/timetable")),
  createTimetable: (payload) => requestData(api.post("/timetable", payload)),
  updateTimetable: (id, payload) => requestData(api.put(`/timetable/${id}`, payload)),
  deleteTimetable: (id) => requestData(api.delete(`/timetable/${id}`)),

  getCategories: () => requestData(api.get("/categories")),
  createCategory: (payload) => requestData(api.post("/categories", payload)),
  updateCategory: (id, payload) => requestData(api.put(`/categories/${id}`, payload)),
  deleteCategory: (id) => requestData(api.delete(`/categories/${id}`)),

  getMaterials: () => requestData(api.get("/materials")),
  uploadMaterial: ({ file, categoryId, title, description }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("categoryId", categoryId);
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);
    return requestData(api.post("/materials/upload", formData));
  },
  updateMaterialCategory: (id, categoryId) => requestData(
    api.put(`/materials/${id}/category`, { categoryId }),
  ),
  deleteMaterial: (id) => requestData(api.delete(`/materials/${id}`)),

  getFlashcards: () => requestData(api.get("/flashcards")),
  createManualFlashcard: (payload) => requestData(api.post("/flashcards/manual", payload)),
  generateFlashcards: (payload) => requestData(api.post("/flashcards/generate", payload)),
  reviewFlashcard: (setId, payload) => requestData(
    api.put(`/flashcards/${setId}/review`, payload),
  ),
  deleteFlashcardSet: (setId) => requestData(api.delete(`/flashcards/${setId}`)),

  getTasks: () => requestData(api.get("/tasks")),
  createTask: (payload) => requestData(api.post("/tasks", payload)),
  completeTask: (id) => requestData(api.patch(`/tasks/${id}/complete`)),
  deleteTask: (id) => requestData(api.delete(`/tasks/${id}`)),

  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return requestData(api.post("/users/avatar", formData));
  },
  updateProfile: (payload) => requestData(api.put("/users/profile", payload)),
  updatePreferences: (payload) => requestData(api.put("/users/preferences", payload)),
};

export default plannerApi;
