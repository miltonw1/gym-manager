import type { SubscriptionStatus } from './auth.types';

export interface SubscriptionPlan {
  id: number;
  name: string;
  days: number;
  price: string;
  active: boolean;
}

export interface SubscriptionHistoryItem {
  id: number;
  status: SubscriptionStatus;
  amount: string;
  planName: string | null;
  days: number | null;
  startDate: string | null;
  endDate: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface CheckoutResponse {
  subscriptionId: number;
  initPoint: string;
  sandboxInitPoint?: string;
}

export interface VerifyResponse {
  status: SubscriptionStatus;
}
