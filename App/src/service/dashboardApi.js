import { plannerApi } from "./plannerApi";

export const getDashboardSummary = () => plannerApi.getDashboardSummary();

export const dashboardApi = {
  getDashboardSummary,
};

export default dashboardApi;
