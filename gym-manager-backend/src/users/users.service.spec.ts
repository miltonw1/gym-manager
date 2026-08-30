import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const userSelect = {
    id: true,
    email: true,
    gymId: true,
    role: true,
    createdAt: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should hash password and create user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        gymId: 1,
      };

      const hashedPassword = 'hashed_password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockPrismaService.user.create.mockResolvedValue({
        id: 1,
        email: createUserDto.email,
        gymId: createUserDto.gymId,
        role: UserRole.STAFF,
        createdAt: new Date(),
      });

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          gymId: createUserDto.gymId,
          password: {
            create: {
              hash: hashedPassword,
            },
          },
        },
        select: userSelect,
      });
      expect(result).not.toHaveProperty('password');
      expect(result.email).toEqual(createUserDto.email);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        {
          id: 1,
          email: 'user1@example.com',
          gymId: 1,
          role: UserRole.STAFF,
          createdAt: new Date(),
        },
        {
          id: 2,
          email: 'user2@example.com',
          gymId: 1,
          role: UserRole.STAFF,
          createdAt: new Date(),
        },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll(1);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { gymId: 1 },
        select: userSelect,
      });
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        gymId: 1,
        role: UserRole.STAFF,
        createdAt: new Date(),
      };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne(1, 1);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1, gymId: 1 },
        select: userSelect,
      });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1, 1)).rejects.toThrow(
        'User with ID 1 not found in this gym',
      );
    });
  });

  describe('update', () => {
    it('should update a user without password', async () => {
      const user = {
        id: 1,
        email: 'old@example.com',
        gymId: 1,
        role: UserRole.STAFF,
        createdAt: new Date(),
      };
      const updateDto = { email: 'new@example.com' };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.user.update.mockResolvedValue({
        ...user,
        email: updateDto.email,
      });

      const result = await service.update(1, 1, updateDto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1, gymId: 1 },
        data: { email: updateDto.email },
        select: userSelect,
      });
      expect(result.email).toEqual(updateDto.email);
    });

    it('should update a user with password', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        gymId: 1,
        role: UserRole.STAFF,
        createdAt: new Date(),
      };
      const updateDto = { password: 'newpassword' };
      const hashedPassword = 'new_hashed_password';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.user.update.mockResolvedValue(user);

      await service.update(1, 1, updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(updateDto.password, 10);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1, gymId: 1 },
        data: {
          password: {
            update: {
              hash: hashedPassword,
            },
          },
        },
        select: userSelect,
      });
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        gymId: 1,
        role: UserRole.STAFF,
        createdAt: new Date(),
      };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.user.delete.mockResolvedValue(user);

      const result = await service.remove(1, 1);

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 1, gymId: 1 },
        select: userSelect,
      });
      expect(result).toEqual(user);
    });
  });
});
