// src/api/courseService.ts
import api from "../../../api/axios";

export const getCourses = () => api.get("/courses");
export const getCourse = (id: number) => api.get(`/courses/${id}`);
export const createCourse = (data: any) => api.post("/courses", data);
export const updateCourse = (id: number, data: any) =>
  api.put(`/courses/${id}`, data);
export const deleteCourse = (id: number) => api.delete(`/courses/${id}`);
