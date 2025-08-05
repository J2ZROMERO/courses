// src/pages/users/services/userService.ts

import api from "../../../../../api/axios";

export interface classes {
  course_ids: number[];
  user_id: number;
}

export function enrollCourseInCertification(id: number, payload: classes) {
  return api.post(`/certifications/${id}/assign-courses`, payload);
}
