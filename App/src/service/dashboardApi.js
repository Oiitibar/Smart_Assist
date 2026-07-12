import api, { unwrap } from "./axios";

export const getDashboardSummary = async () => {
  const response = await api.get("/dashboard/summary");
  return unwrap(response);
};
