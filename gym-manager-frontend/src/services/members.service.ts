import type { Member, MembersResponse, GetMembersParams } from '@/types/members.types';
import apiClient from '@/lib/api-client';

export const membersService = {
  async findAll(params?: GetMembersParams): Promise<MembersResponse> {
    const { data } = await apiClient.get<MembersResponse>('/members', {
      params: {
        ...params,
        status: params?.status === 'ALL' ? undefined : params?.status,
      },
    });
    return data;
  },

  async findOne(id: number): Promise<Member> {
    const { data } = await apiClient.get<Member>('/members/${id}');
    return data;
  },

  async create(member: Omit<Member, 'id' | 'joinDate' | 'active'>): Promise<Member> {
    const { data } = await apiClient.post<Member>('/members', member);
    return data;
  },

  async update(id: number, member: Partial<Member>): Promise<Member> {
    const { data } = await apiClient.patch<Member>('/members/${id}', member);
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete('/members/${id}');
  },

  async getExpired(search?: string): Promise<Member[]> {
    const { data } = await apiClient.get<Member[]>('/members/expired', {
      params: { search },
    });
    return data;
  },

  async getExpiredCount(): Promise<number> {
    const { data } = await apiClient.get<number>('/members/expired-count');
    return data;
  },
};
