export interface MonthlyRevenue {
  month: number;
  year: number;
  totalRevenue: number;
  transactionCount: number;
  details: Array<{
    id: number;
    amount: string;
    paidAt: string;
    member: string;
    dni: string;
    plan: string;
  }>;
}

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
