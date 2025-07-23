// src/services/optionService.ts
import api from "../../../../api/axios";

export interface Option {
  id: number;
  option: string;
  is_correct: boolean;
  question_id: number;
  created_at: string;
  updated_at: string;
}

export interface OptionPayload {
  option: string;
  is_correct: boolean;
  question_id: number;
}

// 1) Obtener opciones de una pregunta
export const getOptionsByQuestion = (questionId: number) => {
  return api.get<{ data: Option[] }>(`/options?question=${questionId}`);
};

// 2) Crear nueva opción
export const createOption = (payload: OptionPayload) => {
  return api.post<Option>("/options", payload);
};

// 3) Actualizar opción existente
export const updateOption = (id: number, payload: OptionPayload) => {
  return api.put<Option>(`/options/${id}`, payload);
};

// 4) Eliminar opción
export const deleteOption = (id: number) => {
  return api.delete<void>(`/options/${id}`);
};
