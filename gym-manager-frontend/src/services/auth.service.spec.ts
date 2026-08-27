import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service';
import apiClient from '@/lib/api-client';

vi.mock('@/lib/api-client');

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call login endpoint', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { access_token: 'token' } });
    const result = await authService.login({ email: 'a@b.com', password: 'secret' });
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'a@b.com',
      password: 'secret',
    });
    expect(result.access_token).toBe('token');
  });

  it('should call register endpoint', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { access_token: 'token' } });
    await authService.register({
      gymName: 'Gym',
      street: 'Av',
      city: 'CABA',
      province: 'CABA',
      phone: '123',
      email: 'c@d.com',
      ownerEmail: 'o@d.com',
      ownerPassword: 'secret',
    });
    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      gymName: 'Gym',
      street: 'Av',
      city: 'CABA',
      province: 'CABA',
      phone: '123',
      email: 'c@d.com',
      ownerEmail: 'o@d.com',
      ownerPassword: 'secret',
    });
  });

  it('should call me endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { user: {}, access_token: 't', subscription: {} } });
    const result = await authService.me();
    expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
    expect(result.access_token).toBe('t');
  });
});
