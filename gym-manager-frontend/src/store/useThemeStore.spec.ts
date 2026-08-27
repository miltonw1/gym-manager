import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from './useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light' });
  });

  it('should have light/dark theme and toggle', () => {
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('dark');
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('should set theme explicitly', () => {
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
  });
});
