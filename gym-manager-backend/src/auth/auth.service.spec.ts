import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { MailService } from '../mail/mail.service';
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
      update: jest.fn(),
    },
    gym: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    passwordResetToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockSubscriptionsService = {
    getStatus: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(() => Promise.resolve('signed-token')),
  };

  const mockMailService = {
    sendPasswordResetEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: SubscriptionsService, useValue: mockSubscriptionsService },
        { provide: MailService, useValue: mockMailService },
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
      mockPrismaService.gym.findUnique.mockResolvedValue({
        id: 1,
        name: 'Gym Demo',
      });

      const result = await service.me(10);
      expect(result.user.email).toBe('owner@fit.com');
      expect(result.subscription.active).toBe(true);
      expect(result.gym?.name).toBe('Gym Demo');
      expect(result.access_token).toBe('signed-token');
    });
  });

  describe('forgotPassword', () => {
    it('should return a generic message even if email does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const result = await service.forgotPassword('nobody@example.com');
      expect(result.message).toMatch(/si el email existe/i);
      expect(
        mockPrismaService.passwordResetToken.create,
      ).not.toHaveBeenCalled();
      expect(mockMailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should create a reset token and send an email for an existing user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 10,
        email: 'owner@fit.com',
      });
      mockPrismaService.passwordResetToken.create.mockResolvedValue({ id: 1 });

      await service.forgotPassword('owner@fit.com');
      expect(
        mockPrismaService.passwordResetToken.updateMany,
      ).toHaveBeenCalled();
      expect(mockPrismaService.passwordResetToken.create).toHaveBeenCalled();
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'owner@fit.com',
        expect.stringContaining('/reset-password?token='),
      );
    });
  });

  describe('resetPassword', () => {
    it('should update the password when token is valid', async () => {
      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue({
        id: 1,
        userId: 10,
        usedAt: null,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        user: { id: 10, email: 'owner@fit.com' },
      });
      mockPrismaService.user.update.mockResolvedValue({ id: 10 });

      const result = await service.resetPassword('valid-token', 'newsecret123');
      expect(mockPrismaService.user.update).toHaveBeenCalled();
      expect(result.message).toMatch(/actualizada/i);
    });

    it('should throw BadRequestException when token is expired', async () => {
      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue({
        id: 1,
        userId: 10,
        usedAt: null,
        expiresAt: new Date(Date.now() - 60 * 60 * 1000),
      });

      await expect(
        service.resetPassword('expired-token', 'newsecret123'),
      ).rejects.toThrow();
    });

    it('should throw BadRequestException when token is already used', async () => {
      mockPrismaService.passwordResetToken.findUnique.mockResolvedValue({
        id: 1,
        userId: 10,
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });

      await expect(
        service.resetPassword('used-token', 'newsecret123'),
      ).rejects.toThrow();
    });
  });
});
