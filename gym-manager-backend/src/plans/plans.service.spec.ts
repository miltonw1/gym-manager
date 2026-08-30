import { Test, TestingModule } from '@nestjs/testing';
import { PlansService } from './plans.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('PlansService', () => {
  let service: PlansService;
  let prisma: PrismaService;

  const mockPrismaService = {
    plan: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlansService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PlansService>(PlansService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a plan', async () => {
      const gymId = 1;
      const dto = { name: 'Monthly', price: 100, durationDays: 30 };
      const expectedPlan = {
        id: 1,
        ...dto,
        price: new Prisma.Decimal(100),
        gymId,
        active: true,
        createdAt: new Date(),
      };
      mockPrismaService.plan.create.mockResolvedValue(expectedPlan);

      const result = await service.create(gymId, dto);

      expect(prisma.plan.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          gymId,
        },
      });
      expect(result).toEqual(expectedPlan);
    });

    it('should default durationDays to 30 if not provided', async () => {
      const gymId = 1;
      const dto = { name: 'Monthly', price: 100 } as any;
      const expectedPlan = {
        id: 1,
        ...dto,
        durationDays: 30,
        price: new Prisma.Decimal(100),
        gymId,
        active: true,
        createdAt: new Date(),
      };
      mockPrismaService.plan.create.mockResolvedValue(expectedPlan);

      await service.create(gymId, dto);

      expect(prisma.plan.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          durationDays: 30,
          gymId,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all active plans for a gym', async () => {
      const gymId = 1;
      const plans = [{ id: 1, name: 'Plan 1', gymId, active: true }];
      mockPrismaService.plan.findMany.mockResolvedValue(plans);

      const result = await service.findAll(gymId);

      expect(prisma.plan.findMany).toHaveBeenCalledWith({
        where: { active: true, gymId: 1 },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(plans);
    });

    it('should return all active plans if gymId is null', async () => {
      const plans = [{ id: 1, name: 'Plan 1', active: true }];
      mockPrismaService.plan.findMany.mockResolvedValue(plans);

      const result = await service.findAll(null);

      expect(prisma.plan.findMany).toHaveBeenCalledWith({
        where: { active: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(plans);
    });
  });

  describe('findOne', () => {
    it('should return a plan if it belongs to the gym', async () => {
      const gymId = 1;
      const planId = 1;
      const plan = { id: planId, name: 'Plan 1', gymId };
      mockPrismaService.plan.findUnique.mockResolvedValue(plan);

      const result = await service.findOne(planId, gymId);

      expect(prisma.plan.findUnique).toHaveBeenCalledWith({
        where: { id: planId },
      });
      expect(result).toEqual(plan);
    });

    it('should throw NotFoundException if plan not found', async () => {
      mockPrismaService.plan.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if plan belongs to another gym', async () => {
      const gymId = 1;
      const planId = 1;
      const plan = { id: planId, name: 'Plan 1', gymId: 2 };
      mockPrismaService.plan.findUnique.mockResolvedValue(plan);

      await expect(service.findOne(planId, gymId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow access if gymId is null (e.g. Super Admin)', async () => {
      const planId = 1;
      const plan = { id: planId, name: 'Plan 1', gymId: 2 };
      mockPrismaService.plan.findUnique.mockResolvedValue(plan);

      const result = await service.findOne(planId, null);

      expect(result).toEqual(plan);
    });
  });

  describe('update', () => {
    it('should update a plan', async () => {
      const gymId = 1;
      const planId = 1;
      const plan = { id: planId, name: 'Plan 1', gymId };
      const dto = { name: 'Plan 1 Updated' };
      mockPrismaService.plan.findUnique.mockResolvedValue(plan);
      mockPrismaService.plan.update.mockResolvedValue({ ...plan, ...dto });

      const result = await service.update(planId, gymId, dto);

      expect(prisma.plan.update).toHaveBeenCalledWith({
        where: { id: planId },
        data: dto,
      });
      expect(result.name).toEqual(dto.name);
    });
  });

  describe('remove', () => {
    it('should mark a plan as inactive', async () => {
      const gymId = 1;
      const planId = 1;
      const plan = { id: planId, name: 'Plan 1', gymId, active: true };
      mockPrismaService.plan.findUnique.mockResolvedValue(plan);
      mockPrismaService.plan.update.mockResolvedValue({
        ...plan,
        active: false,
      });

      const result = await service.remove(planId, gymId);

      expect(prisma.plan.update).toHaveBeenCalledWith({
        where: { id: planId },
        data: { active: false },
      });
      expect(result.active).toBe(false);
    });
  });
});
