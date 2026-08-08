export type UserRole = 'Admin' | 'Customer' | 'Guest';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  token?: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
