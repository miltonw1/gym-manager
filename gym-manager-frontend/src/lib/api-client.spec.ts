import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from './api-client';
import axios from 'axios';

// Mock Zustand store (even if it doesn't exist yet)
vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      accessToken: null,
    })),
  },
}));

import { useAuthStore } from '@/store/useAuthStore';

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have the correct base URL', () => {
    expect(apiClient.defaults.baseURL).toBe('http://localhost:3000');
  });

  it('should add Authorization header if token is present', async () => {
    const mockToken = 'test-token';
    vi.mocked(useAuthStore.getState).mockReturnValue({ accessToken: mockToken } as any);

    // We can test the interceptor by triggering it
    const config = { headers: {} };
    // @ts-ignore - access internal interceptors for testing
    const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    const modifiedConfig = await interceptor(config);

    expect(modifiedConfig.headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  it('should not add Authorization header if no token is present', async () => {
    vi.mocked(useAuthStore.getState).mockReturnValue({ accessToken: null } as any);

    const config = { headers: {} };
    // @ts-ignore
    const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    const modifiedConfig = await interceptor(config);

    expect(modifiedConfig.headers.Authorization).toBeUndefined();
  });
});
