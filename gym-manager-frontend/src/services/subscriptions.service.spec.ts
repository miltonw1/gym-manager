import { describe, it, expect, vi, beforeEach } from 'vitest';
import { subscriptionsService } from './subscriptions.service';
import apiClient from '@/lib/api-client';

vi.mock('@/lib/api-client');

describe('subscriptionsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch plans', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] });
    await subscriptionsService.getPlans();
    expect(apiClient.get).toHaveBeenCalledWith('/subscriptions/plans');
  });

  it('should fetch status', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: {} });
    await subscriptionsService.getStatus();
    expect(apiClient.get).toHaveBeenCalledWith('/subscriptions/me');
  });

  it('should fetch history', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] });
    await subscriptionsService.getHistory();
    expect(apiClient.get).toHaveBeenCalledWith('/subscriptions/history');
  });

  it('should create a checkout', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { subscriptionId: 1 } });
    await subscriptionsService.checkout(30);
    expect(apiClient.post).toHaveBeenCalledWith('/subscriptions/checkout', { planId: 30 });
  });

  it('should verify a payment', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { status: 'APPROVED' } });
    await subscriptionsService.verify(7);
    expect(apiClient.post).toHaveBeenCalledWith('/subscriptions/7/verify');
  });
});
