import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { MercadoPagoService } from './mercadopago.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;

  const mockPrismaService = {
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
    subscriptionPlan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    subscription: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    gym: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockMercadoPago = {
    createPreference: jest.fn(),
    getPayment: jest.fn(),
    findPaymentByExternalReference: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MercadoPagoService, useValue: mockMercadoPago },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    jest.clearAllMocks();
  });

  describe('getStatus', () => {
    it('should never be read-only for a global admin (null gymId)', async () => {
      const status = await service.getStatus(null);
      expect(status.isReadOnly).toBe(false);
      expect(status.active).toBe(true);
    });

    it('should be read-only if gym has no accessUntil', async () => {
      mockPrismaService.gym.findUnique.mockResolvedValue({ accessUntil: null });
      const status = await service.getStatus(1);
      expect(status.isReadOnly).toBe(true);
      expect(status.daysRemaining).toBe(0);
    });

    it('should be read-only if accessUntil is in the past', async () => {
      mockPrismaService.gym.findUnique.mockResolvedValue({
        accessUntil: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      });
      const status = await service.getStatus(1);
      expect(status.isReadOnly).toBe(true);
    });

    it('should be active if accessUntil is in the future', async () => {
      mockPrismaService.gym.findUnique.mockResolvedValue({
        accessUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      });
      const status = await service.getStatus(1);
      expect(status.isReadOnly).toBe(false);
      expect(status.daysRemaining).toBeGreaterThan(0);
    });
  });

  describe('findPlans', () => {
    it('should return active plans ordered by days', async () => {
      mockPrismaService.subscriptionPlan.findMany.mockResolvedValue([
        { id: 1, name: '30 días', days: 30, price: '10000', active: true },
      ]);
      const plans = await service.findPlans();
      expect(plans).toHaveLength(1);
      expect(plans[0].price).toBe('10000');
    });
  });

  describe('checkout', () => {
    it('should create a PENDING subscription and a preference', async () => {
      mockPrismaService.subscriptionPlan.findUnique.mockResolvedValue({
        id: 2,
        name: 'Plan 90 días',
        days: 90,
        price: '27000',
        active: true,
      });
      mockPrismaService.subscription.create.mockResolvedValue({
        id: 10,
        externalReference: 'gym-1-xyz',
      });
      mockMercadoPago.createPreference.mockResolvedValue({
        initPoint: 'https://mercadopago.com/init',
        sandboxInitPoint: 'https://sandbox.mp/init',
        preferenceId: 'pref-1',
      });

      const result = await service.checkout(1, 2, 'owner@gym.com');
      expect(result.subscriptionId).toBe(10);
      expect(result.initPoint).toBe('https://mercadopago.com/init');
      expect(mockPrismaService.subscription.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if plan does not exist', async () => {
      mockPrismaService.subscriptionPlan.findUnique.mockResolvedValue(null);
      await expect(service.checkout(1, 999, 'x@y.com')).rejects.toThrow();
    });
  });

  describe('handleWebhook', () => {
    it('should activate subscription when payment is approved', async () => {
      const sub = {
        id: 5,
        gymId: 1,
        planId: 2,
        status: SubscriptionStatus.PENDING,
        externalReference: 'gym-1-abc',
        plan: { id: 2, name: 'Plan 90 días', days: 90, price: '27000' },
      };
      mockPrismaService.subscription.findUnique.mockResolvedValue(sub);
      mockMercadoPago.getPayment.mockResolvedValue({
        id: '1234',
        status: 'approved',
        external_reference: 'gym-1-abc',
      });
      mockPrismaService.gym.findUnique.mockResolvedValue({ accessUntil: null });
      mockPrismaService.subscription.update.mockResolvedValue(sub);
      mockPrismaService.gym.update.mockResolvedValue({});

      await service.handleWebhook({ type: 'payment', data: { id: '1234' } });
      expect(mockPrismaService.subscription.update).toHaveBeenCalled();
      expect(mockPrismaService.gym.update).toHaveBeenCalled();
    });

    it('should be idempotent (not extend twice if already approved)', async () => {
      const sub = {
        id: 5,
        gymId: 1,
        planId: 2,
        status: SubscriptionStatus.APPROVED,
        externalReference: 'gym-1-abc',
      };
      mockPrismaService.subscription.findUnique.mockResolvedValue(sub);

      await service.handleWebhook({ type: 'payment', data: { id: '1234' } });
      expect(mockPrismaService.subscription.update).not.toHaveBeenCalled();
      expect(mockPrismaService.gym.update).not.toHaveBeenCalled();
    });

    it('should ignore notifications without payment id', async () => {
      const result = await service.handleWebhook({ type: 'merchant_order' });
      expect(result).toEqual({ received: true });
      expect(mockMercadoPago.getPayment).not.toHaveBeenCalled();
    });
  });

  describe('verifyPayment', () => {
    it('should approve a pending subscription via external reference', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue({
        id: 5,
        gymId: 1,
        planId: 2,
        status: SubscriptionStatus.PENDING,
        externalReference: 'gym-1-abc',
        plan: { id: 2, name: 'Plan 90 días', days: 90, price: '27000' },
      });
      mockMercadoPago.findPaymentByExternalReference.mockResolvedValue([
        { id: '999', status: 'approved' },
      ]);
      mockPrismaService.gym.findUnique.mockResolvedValue({ accessUntil: null });
      mockPrismaService.subscription.update.mockResolvedValue({});
      mockPrismaService.gym.update.mockResolvedValue({});

      const result = await service.verifyPayment(1, 5);
      expect(result.status).toBe('approved');
    });

    it('should throw NotFoundException if subscription not found', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue(null);
      await expect(service.verifyPayment(1, 999)).rejects.toThrow();
    });
  });
});
