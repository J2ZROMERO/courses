// src/pages/courses/services/questionService.ts
import api from "../../../api/axios";

export interface Question {
  id: number;
  question: string;
  element_id: number;
}

export interface QuestionPayload {
  question: string;
  element_id: number;
}

// Listar preguntas de un elemento
export const getQuestionsByElement = (element_id: number) =>
  api.get<Question[]>(`/questions?element=${element_id}`);

// Crear una pregunta
export const createQuestion = (payload: QuestionPayload) =>
  api.post<Question>("/questions", payload);

// Actualizar una pregunta
export const updateQuestion = (id: number, payload: Partial<QuestionPayload>) =>
  api.put<Question>(`/questions/${id}`, payload);

// Borrar una pregunta
export const deleteQuestion = (id: number) =>
  api.delete<void>(`/questions/${id}`);
