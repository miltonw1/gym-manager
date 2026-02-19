import { IsInt, IsNotEmpty, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { EnrollmentStatus } from '@prisma/client';

export class CreateEnrollmentDto {
  @IsInt()
  @IsNotEmpty()
  memberId: number;

  @IsInt()
  @IsNotEmpty()
  planId: number;

  @IsDateString()
  @IsOptional()
  startDate?: string; // Si no se provee, usaremos 'now'
}
