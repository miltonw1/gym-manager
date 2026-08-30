import { Test, TestingModule } from '@nestjs/testing';
import { GymsService } from './gyms.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('GymsService', () => {
  let service: GymsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    gym: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const selectFields = {
    id: true,
    name: true,
    street: true,
    city: true,
    province: true,
    country: true,
    phone: true,
    email: true,
    createdAt: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GymsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<GymsService>(GymsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a gym', async () => {
      const createGymDto = {
        name: 'Test Gym',
        street: '123 Test St',
        city: 'Test City',
        province: 'Test Province',
        country: 'Argentina',
        phone: '123456789',
        email: 'gym@test.com',
      };

      const expectedResponse = {
        id: 1,
        ...createGymDto,
        createdAt: new Date(),
      };
      mockPrismaService.gym.create.mockResolvedValue(expectedResponse);

      const result = await service.create(createGymDto);

      expect(prisma.gym.create).toHaveBeenCalledWith({
        data: createGymDto,
        select: selectFields,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findAll', () => {
    it('should return an array of gyms', async () => {
      const gyms = [
        { id: 1, name: 'Gym 1', createdAt: new Date() },
        { id: 2, name: 'Gym 2', createdAt: new Date() },
      ];
      mockPrismaService.gym.findMany.mockResolvedValue(gyms);

      const result = await service.findAll();

      expect(prisma.gym.findMany).toHaveBeenCalledWith({
        select: selectFields,
      });
      expect(result).toEqual(gyms);
    });
  });

  describe('findOne', () => {
    it('should return a single gym', async () => {
      const gym = { id: 1, name: 'Test Gym', createdAt: new Date() };
      mockPrismaService.gym.findUnique.mockResolvedValue(gym);

      const result = await service.findOne(1);

      expect(prisma.gym.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: selectFields,
      });
      expect(result).toEqual(gym);
    });

    it('should throw NotFoundException if gym not found', async () => {
      mockPrismaService.gym.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a gym', async () => {
      const gym = { id: 1, name: 'Old Name' };
      const updateDto = { name: 'New Name' };

      mockPrismaService.gym.findUnique.mockResolvedValue(gym);
      mockPrismaService.gym.update.mockResolvedValue({ ...gym, ...updateDto });

      const result = await service.update(1, updateDto);

      expect(prisma.gym.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
        select: selectFields,
      });
      expect(result.name).toEqual(updateDto.name);
    });
  });

  describe('remove', () => {
    it('should delete a gym', async () => {
      const gym = { id: 1, name: 'To be deleted' };
      mockPrismaService.gym.findUnique.mockResolvedValue(gym);
      mockPrismaService.gym.delete.mockResolvedValue(gym);

      const result = await service.remove(1);

      expect(prisma.gym.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        select: selectFields,
      });
      expect(result).toEqual(gym);
    });
  });
});
