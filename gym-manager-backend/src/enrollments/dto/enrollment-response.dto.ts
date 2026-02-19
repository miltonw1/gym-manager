import { EnrollmentStatus } from '@prisma/client';

export class EnrollmentResponseDto {
  id: number;
  memberId: number;
  planId: number;
  startDate: Date;
  endDate: Date;
  status: EnrollmentStatus;
  createdAt: Date;
  
  // Opcionales para incluir info del socio y el plan
  member?: any;
  plan?: any;
}
