export type UserRole = 'ADMIN' | 'STAFF';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  gymId: number | null;
}

export type SubscriptionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface GymSubscriptionStatus {
  isReadOnly: boolean;
  accessUntil: string | null;
  daysRemaining: number;
  active: boolean;
}

export interface LoginResponse {
  access_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  gymName: string;
  street: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  ownerEmail: string;
  ownerPassword: string;
}

export interface MeResponse {
  user: User;
  access_token: string;
  subscription: GymSubscriptionStatus;
}
