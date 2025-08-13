// src/pages/courses/services/sectionItemService.ts
import api from "../../../api/axios";

export interface SectionItemPayload {
  title: string;
  url: string;
  position: number;
  section_id: number;
  type: number;
}

export interface SectionItem extends SectionItemPayload {
  id: number;
  created_at: string;
  updated_at: string;
}

// Listar items de una sección
export const getContentBySectionItems = (sectionId: number) =>
  api.get<SectionItem[]>(`/elements?subsection=${sectionId}`);

// Crear un item
export const createContentBySectionItem = (payload: SectionItemPayload) =>
  api.post("/elements", payload);

// Actualizar un item
export const updateContentBySectionItem = (
  id: number,
  payload: Partial<SectionItemPayload>
) => api.put(`/elements/${id}`, payload);

// Borrar un item
export const deleteContentBySectionItem = (id: number) =>
  api.delete(`/elements/${id}`);
