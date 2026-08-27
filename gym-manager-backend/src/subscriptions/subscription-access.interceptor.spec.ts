import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';
import { SubscriptionAccessInterceptor } from './subscription-access.interceptor';
import { PrismaService } from '../prisma/prisma.service';

const buildContext = (req: any): ExecutionContext => {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => ({ name: 'handler' }),
    getClass: () => ({ name: 'class' }),
  } as unknown as ExecutionContext;
};

describe('SubscriptionAccessInterceptor', () => {
  const mockPrismaService = {
    gym: {
      findUnique: jest.fn(),
    },
  };

  let interceptor: SubscriptionAccessInterceptor;

  beforeEach(() => {
    jest.clearAllMocks();
    interceptor = new SubscriptionAccessInterceptor(mockPrismaService as unknown as PrismaService);
  });

  it('should allow public requests (no user)', () => {
    const req = { method: 'POST', originalUrl: '/subscriptions/webhook' };
    const next = { handle: () => of('ok') };
    interceptor.intercept(buildContext(req), next).subscribe();
    expect(mockPrismaService.gym.findUnique).not.toHaveBeenCalled();
  });

  it('should allow global admin (null gymId)', () => {
    const req = {
      method: 'POST',
      originalUrl: '/members',
      user: { gymId: null },
    };
    const next = { handle: () => of('ok') };
    interceptor.intercept(buildContext(req), next).subscribe();
    expect(mockPrismaService.gym.findUnique).not.toHaveBeenCalled();
  });

  it('should allow GET requests', () => {
    const req = { method: 'GET', originalUrl: '/members', user: { gymId: 1 } };
    const next = { handle: () => of('ok') };
    interceptor.intercept(buildContext(req), next).subscribe();
    expect(mockPrismaService.gym.findUnique).not.toHaveBeenCalled();
  });

  it('should allow subscription routes always', () => {
    const req = {
      method: 'POST',
      originalUrl: '/subscriptions/checkout',
      user: { gymId: 1 },
    };
    const next = { handle: () => of('ok') };
    interceptor.intercept(buildContext(req), next).subscribe();
    expect(mockPrismaService.gym.findUnique).not.toHaveBeenCalled();
  });

  it('should block writes when suspended (read-only)', async () => {
    mockPrismaService.gym.findUnique.mockResolvedValue({ accessUntil: null });
    const req = { method: 'POST', originalUrl: '/members', user: { gymId: 1 } };
    const next = { handle: () => of('ok') };

    await expect(
      lastValueFrom(interceptor.intercept(buildContext(req), next)),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should allow writes when access is active', async () => {
    mockPrismaService.gym.findUnique.mockResolvedValue({
      accessUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });
    const req = { method: 'POST', originalUrl: '/members', user: { gymId: 1 } };
    const next = { handle: () => of('created') };

    const result = await lastValueFrom(
      interceptor.intercept(buildContext(req), next),
    );
    expect(result).toBe('created');
  });
});
