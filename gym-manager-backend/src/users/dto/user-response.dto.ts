import { UserRole } from '@prisma/client';

export class UserResponseDto {
  id: number;
  gymId: number | null;
  email: string;
  role: UserRole;
  createdAt: Date;
}