export interface Member {
  id: number;
  gymId: number;
  firstName: string;
  lastName: string;
  dni: string;
  phone?: string;
  email?: string;
  joinDate: string;
  active: boolean;
  status?: 'ACTIVE' | 'EXPIRED' | 'NO_PLAN';
  nextExpiryDate?: string | null;
}

export interface MembersResponse {
  total: number;
  skip: number;
  take: number;
  members: Member[];
}

export const MemberFilterStatus = {
  ALL: 'ALL',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  INACTIVE: 'INACTIVE',
} as const;

export type MemberFilterStatusType = (typeof MemberFilterStatus)[keyof typeof MemberFilterStatus];

export interface GetMembersParams {
  skip?: number;
  take?: number;
  search?: string;
  status?: MemberFilterStatusType;
}
