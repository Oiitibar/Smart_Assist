import api, { unwrap } from "./axios";

export const getTimetable = async () => {
  const response = await api.get("/timetable");
  return unwrap(response);
};

export const getTodayTimetable = async () => {
  const response = await api.get("/timetable/today");
  return unwrap(response);
};

export const createTimetableItem = async (payload) => {
  const response = await api.post("/timetable", payload);
  return unwrap(response);
};

export const updateTimetableItem = async (id, payload) => {
  const response = await api.put(`/timetable/${id}`, payload);
  return unwrap(response);
};

export const deleteTimetableItem = async (id) => {
  const response = await api.delete(`/timetable/${id}`);
  return unwrap(response);
};
