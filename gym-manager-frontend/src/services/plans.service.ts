import apiClient from '@/lib/api-client';

export interface Plan {
  id: number;
  gymId: number;
  name: string;
  price: string;
  durationDays: number;
  active: boolean;
}

export interface CreatePlanDto {
  name: string;
  price: number;
  durationDays: number;
}

export interface UpdatePlanDto {
  name?: string;
  price?: number;
  durationDays?: number;
}

export const plansService = {
  async findAll(): Promise<Plan[]> {
    const { data } = await apiClient.get<Plan[]>('/plans');
    return data;
  },

  async create(plan: CreatePlanDto): Promise<Plan> {
    const { data } = await apiClient.post<Plan>('/plans', plan);
    return data;
  },

  async update(id: number, plan: UpdatePlanDto): Promise<Plan> {
    const { data } = await apiClient.patch<Plan>(`/plans/${id}`, plan);
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/plans/${id}`);
  },
};
