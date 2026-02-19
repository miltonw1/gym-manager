import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanResponseDto } from './dto/plan-response.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(gymId: number, createPlanDto: CreatePlanDto): Promise<PlanResponseDto> {
    const { durationDays, ...rest } = createPlanDto;
    return this.prisma.plan.create({
      data: {
        ...rest,
        durationDays: durationDays ?? 30,
        gymId,
      },
    });
  }

  async findAll(gymId: number | null): Promise<PlanResponseDto[]> {
    const whereCondition: any = { active: true };
    
    if (gymId !== null && gymId !== undefined) {
      whereCondition.gymId = Number(gymId);
    }
    
    return this.prisma.plan.findMany({
      where: whereCondition,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number, gymId: number | null): Promise<PlanResponseDto> {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    if (gymId && plan.gymId !== gymId) {
      throw new ForbiddenException('You do not have access to this plan');
    }

    return plan;
  }

  async update(id: number, gymId: number | null, updatePlanDto: UpdatePlanDto): Promise<PlanResponseDto> {
    await this.findOne(id, gymId);

    return this.prisma.plan.update({
      where: { id },
      data: updatePlanDto,
    });
  }

  async remove(id: number, gymId: number | null): Promise<PlanResponseDto> {
    await this.findOne(id, gymId);

    return this.prisma.plan.update({
      where: { id },
      data: { active: false },
    });
  }
}
