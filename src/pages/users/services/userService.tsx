// src/pages/users/services/userService.ts
import api from "../../../api/axios";

export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
}

export function getUsers() {
  return api.get("/users");
}

export function createUser(data: User) {
  return api.post("/register", data);
}

export function updateUser(id: number, data: Partial<User>) {
  return api.put(`/users/${id}`, data);
}

export function deleteUser(id: number) {
  return api.delete(`/users/${id}`);
}
