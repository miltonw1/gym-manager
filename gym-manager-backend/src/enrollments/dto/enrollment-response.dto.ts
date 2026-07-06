import { EnrollmentStatus, Member, Plan } from '@prisma/client';

export class EnrollmentResponseDto {
  id: number;
  memberId: number;
  planId: number;
  startDate: Date;
  endDate: Date;
  status: EnrollmentStatus;
  createdAt: Date;

  member?: Pick<Member, 'firstName' | 'lastName' | 'dni'> | Member;
  plan?: Pick<Plan, 'name' | 'price' | 'durationDays'> | Plan;
}
