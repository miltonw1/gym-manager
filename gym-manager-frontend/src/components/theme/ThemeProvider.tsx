import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <>{children}</>;
};

export default ThemeProvider;
