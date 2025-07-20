import api from "../../../api/axios";

export const getSections = (courseId: number) =>
  api.get(`/sections?course=${courseId}`);

export const createSection = (data: { title: string; position?: number }) =>
  api.post(`/sections`, data);

export const updateSection = (
  id: number,
  data: { title?: string; position?: number }
) => api.put(`/sections/${id}`, data);

export const deleteSection = (id: number) => api.delete(`/sections/${id}`);
