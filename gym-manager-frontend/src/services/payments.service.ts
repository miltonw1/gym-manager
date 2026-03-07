import apiClient from '@/lib/api-client';
import type { MonthlyRevenue } from '@/types/payments.types';

export const paymentsService = {
  async getRevenue(month?: number, year?: number): Promise<MonthlyRevenue> {
    const { data } = await apiClient.get<MonthlyRevenue>('/payments/revenue', {
      params: { month, year },
    });
    return data;
  },
};
