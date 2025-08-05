// src/api/courseService.ts
import api from "../../../api/axios";

export const getCertifications = () => api.get("/certifications");
export const getCertification = (id: number) =>
  api.get(`/certifications/${id}`);
export const createCertification = (data: any) =>
  api.post("/certifications", data);
export const updateCertification = (id: number, data: any) =>
  api.put(`/certifications/${id}`, data);
export const deleteCertification = (id: number) =>
  api.delete(`/certifications/${id}`);
