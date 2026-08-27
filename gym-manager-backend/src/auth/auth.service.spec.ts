import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    validateUser: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPrismaService = {
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    gym: {
      create: jest.fn(),
    },
  };

  const mockSubscriptionsService = {
    getStatus: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(() => Promise.resolve('signed-token')),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: SubscriptionsService, useValue: mockSubscriptionsService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    const registerDto = {
      gymName: 'Gym Fit',
      street: 'Av 123',
      city: 'CABA',
      province: 'CABA',
      phone: '1122334455',
      email: 'contacto@gym.com',
      ownerEmail: 'owner@fit.com',
      ownerPassword: 'secret123',
    };

    it('should create a gym with a trial accessUntil and an admin user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.gym.create.mockResolvedValue({ id: 1 });
      mockPrismaService.user.create.mockResolvedValue({
        id: 10,
        email: 'owner@fit.com',
        gymId: 1,
        role: UserRole.ADMIN,
      });

      const result = await service.register(registerDto as any);

      expect(mockPrismaService.gym.create).toHaveBeenCalled();
      const gymCreateArgs = mockPrismaService.gym.create.mock.calls[0][0].data;
      expect(gymCreateArgs.accessUntil).toBeInstanceOf(Date);
      expect(gymCreateArgs.accessUntil.getTime()).toBeGreaterThan(Date.now());
      expect(result.access_token).toBe('signed-token');
    });

    it('should throw ConflictException if owner email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: registerDto.ownerEmail,
      });

      await expect(service.register(registerDto as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('me', () => {
    it('should return the user and subscription status', async () => {
      mockUsersService.findOne.mockResolvedValue({
        id: 10,
        email: 'owner@fit.com',
        role: UserRole.ADMIN,
        gymId: 1,
      });
      mockSubscriptionsService.getStatus.mockResolvedValue({
        isReadOnly: false,
        accessUntil: new Date(),
        daysRemaining: 20,
        active: true,
      });

      const result = await service.me(10);
      expect(result.user.email).toBe('owner@fit.com');
      expect(result.subscription.active).toBe(true);
      expect(result.access_token).toBe('signed-token');
    });
  });
});
