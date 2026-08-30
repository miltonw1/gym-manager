import apiClient from '@/lib/api-client';
import type { MonthlyRevenue, RevenueByPlan, RevenuePeriod } from '@/types/payments.types';

export const paymentsService = {
  async getRevenue(month?: number, year?: number): Promise<MonthlyRevenue> {
    const { data } = await apiClient.get<MonthlyRevenue>('/payments/revenue', {
      params: { month, year },
    });
    return data;
  },

  async getRevenueByPlan(
    period: RevenuePeriod = 'month',
    month?: number,
    year?: number,
  ): Promise<RevenueByPlan> {
    const { data } = await apiClient.get<RevenueByPlan>('/payments/revenue-by-plan', {
      params: { period, month, year },
    });
    return data;
  },
};
