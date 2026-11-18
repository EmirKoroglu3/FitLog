import apiClient from '../api/client';

export interface AdminStats {
  totalUsers: number;
  activeLast7Days: number;
  newLast7Days: number;
  lockedUsers: number;
  totalWorkouts: number;
  totalMeals: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  surname: string;
  createdDate: string;
  lastActivity?: string | null;
  workoutCount: number;
  mealCount: number;
  isLocked: boolean;
  isAdmin: boolean;
}

export interface AdminUserPage {
  items: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

type Message = { message: string };

/** Admin-only API (the server checks the Admin role on every call). */
const adminService = {
  stats: async () => (await apiClient.get<AdminStats>('/admin/stats')).data,
  users: async (search: string, page: number, pageSize = 20) =>
    (await apiClient.get<AdminUserPage>('/admin/users', { params: { search: search || undefined, page, pageSize } })).data,
  lock: async (id: string) => (await apiClient.post<Message>(`/admin/users/${id}/lock`)).data,
  unlock: async (id: string) => (await apiClient.post<Message>(`/admin/users/${id}/unlock`)).data,
  sendPasswordReset: async (id: string) => (await apiClient.post<Message>(`/admin/users/${id}/password-reset`)).data,
  remove: async (id: string) => (await apiClient.delete<Message>(`/admin/users/${id}`)).data,
};

export default adminService;
