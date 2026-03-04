import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  setAuth: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAuth: (token) => set({ accessToken: token }),
  logout: () => set({ accessToken: null }),
}));
