import api, { unwrap } from "./axios";

const documentAiApi = {
  ask: async (materialId, payload) => {
    const response = await api.post(`/materials/${materialId}/study/ask`, payload);
    return unwrap(response);
  },

  getViewUrl: (materialId) => {
    const baseURL = String(api.defaults.baseURL || "http://localhost:5000/api").replace(/\/$/, "");
    return `${baseURL}/materials/${materialId}/view`;
  },
};

export default documentAiApi;
