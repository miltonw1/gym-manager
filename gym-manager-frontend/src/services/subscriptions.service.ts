import apiClient from '@/lib/api-client';
import type { GymSubscriptionStatus } from '@/types/auth.types';
import type {
  SubscriptionPlan,
  SubscriptionHistoryItem,
  CheckoutResponse,
  VerifyResponse,
} from '@/types/subscriptions.types';

export const subscriptionsService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data } = await apiClient.get<SubscriptionPlan[]>('/subscriptions/plans');
    return data;
  },

  async getStatus(): Promise<GymSubscriptionStatus> {
    const { data } = await apiClient.get<GymSubscriptionStatus>('/subscriptions/me');
    return data;
  },

  async getHistory(): Promise<SubscriptionHistoryItem[]> {
    const { data } = await apiClient.get<SubscriptionHistoryItem[]>('/subscriptions/history');
    return data;
  },

  async checkout(planId: number): Promise<CheckoutResponse> {
    const { data } = await apiClient.post<CheckoutResponse>('/subscriptions/checkout', { planId });
    return data;
  },

  async verify(subscriptionId: number): Promise<VerifyResponse> {
    const { data } = await apiClient.post<VerifyResponse>(`/subscriptions/${subscriptionId}/verify`);
    return data;
  },
};
