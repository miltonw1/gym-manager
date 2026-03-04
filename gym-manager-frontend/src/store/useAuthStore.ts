import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  setAuth: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      setAuth: (token) => set({ accessToken: token }),
      logout: () => set({ accessToken: null }),
    }),
    {
      name: 'gym-manager-auth',
    }
  )
);
