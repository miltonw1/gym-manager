import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from './api-client';
import { useAuthStore } from '@/store/useAuthStore';
import { AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

// Mock Zustand store (even if it doesn't exist yet)
vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      accessToken: null,
    })),
  },
}));

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
    const config = { 
      headers: new AxiosHeaders() 
    } as InternalAxiosRequestConfig;
    
    // @ts-ignore - access internal interceptors for testing
    const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    const modifiedConfig = await interceptor(config);

    expect(modifiedConfig.headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  it('should not add Authorization header if no token is present', async () => {
    vi.mocked(useAuthStore.getState).mockReturnValue({ accessToken: null } as any);

    const config = { 
      headers: new AxiosHeaders() 
    } as InternalAxiosRequestConfig;

    // @ts-ignore
    const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    const modifiedConfig = await interceptor(config);

    expect(modifiedConfig.headers.Authorization).toBeUndefined();
  });
});
