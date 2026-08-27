import { useAuthStore } from '@/store/useAuthStore';

export const useIsReadOnly = () => {
  const { subscription } = useAuthStore();
  return subscription?.isReadOnly ?? false;
};
