export class MemberResponseDto {
  id: number;
  gymId: number;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string | null;
  email: string | null;
  joinDate: Date;
  active: boolean;
}
