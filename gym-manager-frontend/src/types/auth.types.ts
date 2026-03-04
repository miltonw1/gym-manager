export type UserRole = 'ADMIN' | 'STAFF';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  gymId: number | null;
}

export interface LoginResponse {
  access_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
