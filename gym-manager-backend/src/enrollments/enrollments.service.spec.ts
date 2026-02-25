import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsService } from './enrollments.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { EnrollmentStatus } from '@prisma/client';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    member: {
      findUnique: jest.fn(),
    },
    plan: {
      findUnique: jest.fn(),
    },
    enrollment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const gymId = 1;
    const memberId = 1;
    const planId = 1;
    const mockMember = { id: memberId, gymId, firstName: 'John' };
    const mockPlan = { id: planId, gymId, name: 'Monthly', durationDays: 30 };

    it('should create a new enrollment starting today if no active enrollment exists', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.plan.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.enrollment.findFirst.mockResolvedValue(null); // No previous enrollment
      
      const dto = { memberId, planId };
      const now = new Date();
      
      mockPrismaService.enrollment.create.mockImplementation(({ data }) => ({
        id: 1,
        ...data,
      }));

      const result = await service.create(gymId, dto);

      expect(result.startDate.getTime()).toBeGreaterThanOrEqual(now.getTime() - 1000);
      expect(result.planId).toBe(planId);
      expect(prisma.enrollment.create).toHaveBeenCalled();
    });

    it('should chain enrollment if an active one exists (Automatic Renewal)', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.plan.findUnique.mockResolvedValue(mockPlan);
      
      const existingEndDate = new Date();
      existingEndDate.setDate(existingEndDate.getDate() + 10); // Expira en 10 días
      
      mockPrismaService.enrollment.findFirst.mockResolvedValue({
        id: 100,
        endDate: existingEndDate,
        status: EnrollmentStatus.ACTIVE,
      });

      const dto = { memberId, planId };
      
      mockPrismaService.enrollment.create.mockImplementation(({ data }) => ({
        id: 101,
        ...data,
      }));

      const result = await service.create(gymId, dto);

      // La nueva inscripción debe empezar exactamente cuando termina la anterior
      expect(result.startDate.toISOString()).toBe(existingEndDate.toISOString());
      
      // La fecha de fin debe ser startDate + 30 días
      const expectedEndDate = new Date(existingEndDate);
      expectedEndDate.setDate(expectedEndDate.getDate() + mockPlan.durationDays);
      expect(result.endDate.toISOString()).toBe(expectedEndDate.toISOString());
    });

    it('should throw ForbiddenException if member belongs to another gym', async () => {
        mockPrismaService.member.findUnique.mockResolvedValue({ ...mockMember, gymId: 2 });
        mockPrismaService.plan.findUnique.mockResolvedValue(mockPlan);

        await expect(service.create(gymId, { memberId, planId })).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findByMember', () => {
    it('should return enrollments for a member in the same gym', async () => {
      const gymId = 1;
      const memberId = 1;
      const enrollments = [{ id: 1, memberId, planId: 1 }];
      
      mockPrismaService.member.findUnique.mockResolvedValue({ id: memberId, gymId });
      mockPrismaService.enrollment.findMany.mockResolvedValue(enrollments);

      const result = await service.findByMember(memberId, gymId);

      expect(result).toEqual(enrollments);
      expect(prisma.enrollment.findMany).toHaveBeenCalledWith({
        where: { memberId },
        include: expect.any(Object),
        orderBy: { startDate: 'desc' },
      });
    });

    it('should throw ForbiddenException if member belongs to another gym', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue({ id: 1, gymId: 2 });

      await expect(service.findByMember(1, 1)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(service.findByMember(1, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
