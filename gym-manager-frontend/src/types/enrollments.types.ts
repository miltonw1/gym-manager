export interface Enrollment {
  id: number;
  memberId: number;
  planId: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELED';
  createdAt: string;
  member?: {
    firstName: string;
    lastName: string;
    dni: string;
  };
  plan?: {
    name: string;
    price: string;
    durationDays: number;
  };
}

export interface CreateEnrollmentDto {
  memberId: number;
  planId: number;
  startDate: string;
}

export interface UpdateEnrollmentDto {
  status?: 'ACTIVE' | 'EXPIRED' | 'CANCELED';
  endDate?: string;
}
