import apiClient from '@/lib/api-client';
import type { Enrollment, CreateEnrollmentDto, UpdateEnrollmentDto } from '@/types/enrollments.types';

export const enrollmentsService = {
  async findAll(): Promise<Enrollment[]> {
    const { data } = await apiClient.get<Enrollment[]>('/enrollments');
    return data;
  },

  async findByMember(memberId: number): Promise<Enrollment[]> {
    const { data } = await apiClient.get<Enrollment[]>(`/enrollments/member/${memberId}`);
    return data;
  },

  async findExpiring(days?: number): Promise<Enrollment[]> {
    const { data } = await apiClient.get<Enrollment[]>('/enrollments/expiring', {
      params: { days },
    });
    return data;
  },

  async create(enrollment: CreateEnrollmentDto): Promise<Enrollment> {
    const { data } = await apiClient.post<Enrollment>('/enrollments', enrollment);
    return data;
  },

  async update(id: number, enrollment: UpdateEnrollmentDto): Promise<Enrollment> {
    const { data } = await apiClient.patch<Enrollment>(`/enrollments/${id}`, enrollment);
    return data;
  },

  async renew(id: number): Promise<Enrollment> {
    const { data } = await apiClient.post<Enrollment>(`/enrollments/${id}/renew`);
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/enrollments/${id}`);
  },
};
