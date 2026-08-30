export interface MonthlyRevenue {
  month: number;
  year: number;
  totalRevenue: number;
  transactionCount: number;
  previousMonth: {
    month: number;
    year: number;
    totalRevenue: number;
    transactionCount: number;
  };
  changePercent: number | null;
  details: Array<{
    id: number;
    amount: string;
    paidAt: string;
    member: string;
    dni: string;
    plan: string;
  }>;
}

export interface RevenueByPlanItem {
  planName: string;
  total: number;
  count: number;
}

export interface RevenueByPlan {
  period: 'month' | 'year' | 'all';
  month?: number;
  year?: number;
  totalRevenue: number;
  items: RevenueByPlanItem[];
}

export type RevenuePeriod = 'month' | 'year' | 'all';

export interface ExpiringEnrollment {
  id: number;
  memberId: number;
  planId: number;
  startDate: string;
  endDate: string;
  status: string;
  member: {
    firstName: string;
    lastName: string;
    dni: string;
  };
  plan: {
    name: string;
  };
}
