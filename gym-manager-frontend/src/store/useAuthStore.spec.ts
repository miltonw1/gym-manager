import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset state before each test
    useAuthStore.getState().logout();
  });

  it('should have initial state with no token', () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
  });

  it('should update token when calling setAuth', () => {
    const testToken = 'test-jwt-token';
    useAuthStore.getState().setAuth(testToken);
    
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe(testToken);
  });

  it('should clear token when calling logout', () => {
    useAuthStore.getState().setAuth('some-token');
    useAuthStore.getState().logout();
    
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
  });
});
