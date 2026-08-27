import { SubscriptionStatus } from '@prisma/client';

export interface SubscriptionStatusResponse {
  isReadOnly: boolean;
  accessUntil: Date | null;
  daysRemaining: number;
  active: boolean;
}

export interface SubscriptionPlanResponse {
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
  startDate: Date | null;
  endDate: Date | null;
  paidAt: Date | null;
  createdAt: Date;
}

export interface CheckoutResponse {
  subscriptionId: number;
  initPoint: string;
  sandboxInitPoint?: string;
}
