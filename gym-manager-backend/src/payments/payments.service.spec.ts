import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    payment: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRevenue', () => {
    it('should compute revenue and compare to previous month', async () => {
      const gymId = 1;
      const currentPayments = [
        {
          id: 1,
          amount: new Prisma.Decimal(100),
          paidAt: new Date(),
          enrollment: {
            member: { firstName: 'Ana', lastName: 'Lopez', dni: '123' },
            plan: { name: 'Crossfit' },
          },
        },
        {
          id: 2,
          amount: new Prisma.Decimal(200),
          paidAt: new Date(),
          enrollment: {
            member: { firstName: 'Juan', lastName: 'Perez', dni: '456' },
            plan: { name: 'Pesas' },
          },
        },
      ];
      const prevPayments = [{ amount: new Prisma.Decimal(150) }];

      mockPrismaService.payment.findMany
        .mockResolvedValueOnce(currentPayments)
        .mockResolvedValueOnce(prevPayments);

      const result = await service.getRevenue(gymId, 5, 2026);

      expect(prisma.payment.findMany).toHaveBeenCalledTimes(2);
      expect(result.month).toBe(5);
      expect(result.year).toBe(2026);
      expect(result.totalRevenue).toBe(300);
      expect(result.transactionCount).toBe(2);
      expect(result.previousMonth).toEqual({
        month: 4,
        year: 2026,
        totalRevenue: 150,
        transactionCount: 1,
      });
      expect(result.changePercent).toBe(100);
      expect(result.details).toHaveLength(2);
    });

    it('should handle January by going back to December of previous year', async () => {
      const gymId = 1;
      mockPrismaService.payment.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      await service.getRevenue(gymId, 1, 2026);

      const prevCall: any = mockPrismaService.payment.findMany.mock.calls[1][0];
      expect(prevCall.where.paidAt.gte).toEqual(new Date(2025, 11, 1));
    });

    it('should return changePercent null when previous month had no revenue but current does', async () => {
      const gymId = 1;
      mockPrismaService.payment.findMany
        .mockResolvedValueOnce([
          {
            id: 1,
            amount: new Prisma.Decimal(100),
            paidAt: new Date(),
            enrollment: {
              member: { firstName: 'A', lastName: 'B', dni: '1' },
              plan: { name: 'Crossfit' },
            },
          },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.getRevenue(gymId, 5, 2026);

      expect(result.changePercent).toBeNull();
    });
  });

  describe('getRevenueByPlan', () => {
    const payments = [
      {
        amount: new Prisma.Decimal(100),
        enrollment: { plan: { name: 'Crossfit' } },
      },
      {
        amount: new Prisma.Decimal(50),
        enrollment: { plan: { name: 'Pesas' } },
      },
      {
        amount: new Prisma.Decimal(200),
        enrollment: { plan: { name: 'Crossfit' } },
      },
    ];

    beforeEach(() => {
      mockPrismaService.payment.findMany.mockResolvedValue(payments);
    });

    it('should aggregate revenue by plan ordered by total desc', async () => {
      const result = await service.getRevenueByPlan(1, 'month', 5, 2026);

      expect(result.period).toBe('month');
      expect(result.month).toBe(5);
      expect(result.year).toBe(2026);
      expect(result.items).toEqual([
        { planName: 'Crossfit', total: 300, count: 2 },
        { planName: 'Pesas', total: 50, count: 1 },
      ]);
      expect(result.totalRevenue).toBe(350);
    });

    it('should apply no date filter for all time', async () => {
      await service.getRevenueByPlan(1, 'all', 5, 2026);

      const call: any = mockPrismaService.payment.findMany.mock.calls[0][0];
      expect(call.where.paidAt).toBeUndefined();
    });

    it('should apply a full year range for the year period', async () => {
      await service.getRevenueByPlan(1, 'year', 5, 2026);

      const call: any = mockPrismaService.payment.findMany.mock.calls[0][0];
      expect(call.where.paidAt.gte).toEqual(new Date(2026, 0, 1));
      expect(call.where.paidAt.lte).toEqual(
        new Date(2026, 11, 31, 23, 59, 59, 999),
      );
    });
  });
});
