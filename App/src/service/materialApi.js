import api, { unwrap } from "./axios";

export const getMaterials = async () => {
  const response = await api.get("/materials");
  return unwrap(response);
};

export const uploadMaterial = async (file, categoryId = "") => {
  const formData = new FormData();
  formData.append("file", file);
  if (categoryId) formData.append("categoryId", categoryId);

  const response = await api.post("/materials/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return unwrap(response);
};

export const assignMaterialCategory = async (materialId, categoryId) => {
  const response = await api.put(`/materials/${materialId}/category`, { categoryId });
  return unwrap(response);
};

export const deleteMaterial = async (id) => {
  const response = await api.delete(`/materials/${id}`);
  return unwrap(response);
};
