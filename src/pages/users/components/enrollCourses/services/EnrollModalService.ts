// src/pages/users/services/userService.ts

import api from "../../../../../api/axios";

export interface classes {
  course_ids: number[];
  user_id: number;
}

export function enrollUserToCertifications(payload: classes) {
  return api.post("/sign-to-certification", payload);
}
