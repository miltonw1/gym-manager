import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, GymSubscriptionStatus } from '@/types/auth.types';
import { authService } from '@/services/auth.service';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  subscription: GymSubscriptionStatus | null;
  setAuth: (token: string) => void;
  setSubscription: (sub: GymSubscriptionStatus) => void;
  loadProfile: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      subscription: null,

      setAuth: (token) => set({ accessToken: token }),
      setSubscription: (sub) => set({ subscription: sub }),

      loadProfile: async () => {
        const { accessToken } = get();
        if (!accessToken) return;
        try {
          const me = await authService.me();
          set({
            accessToken: me.access_token,
            user: me.user,
            subscription: me.subscription,
          });
        } catch {
          // Token inválido: el interceptor de axios se encarga de limpiar
          set({ accessToken: null, user: null, subscription: null });
        }
      },

      logout: () => set({ accessToken: null, user: null, subscription: null }),
    }),
    {
      name: 'gym-manager-auth',
      partialize: (state) => ({ accessToken: state.accessToken }),
    }
  )
);
