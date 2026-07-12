import api, { unwrap } from "./axios";

export const getCategories = async () => {
  const response = await api.get("/categories");
  return unwrap(response);
};

export const createCategory = async (payload) => {
  const response = await api.post("/categories", payload);
  return unwrap(response);
};

export const updateCategory = async (id, payload) => {
  const response = await api.put(`/categories/${id}`, payload);
  return unwrap(response);
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return unwrap(response);
};
