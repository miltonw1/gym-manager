import { Prisma } from '@prisma/client';

export class PlanResponseDto {
  id: number;
  gymId: number;
  name: string;
  price: Prisma.Decimal;
  durationDays: number;
  active: boolean;
  createdAt: Date;
}
