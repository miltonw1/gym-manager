import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('MembersService', () => {
  let service: MembersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    member: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a member', async () => {
      const gymId = 1;
      const dto = { firstName: 'John', lastName: 'Doe', dni: '12345678' };
      mockPrismaService.member.findUnique.mockResolvedValue(null);
      mockPrismaService.member.create.mockResolvedValue({ id: 1, ...dto, gymId, joinDate: new Date(), active: true });

      const result = await service.create(gymId, dto);

      expect(prisma.member.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          gymId,
        }
      });
      expect(result.dni).toEqual(dto.dni);
    });

    it('should throw ConflictException if DNI already exists in the gym', async () => {
      const gymId = 1;
      const dto = { firstName: 'John', lastName: 'Doe', dni: '12345678' };
      mockPrismaService.member.findUnique.mockResolvedValue({ id: 1, ...dto, gymId });

      await expect(service.create(gymId, dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all members for a gym', async () => {
      const gymId = 1;
      const members = [{ id: 1, firstName: 'John', gymId, enrollments: [] }];
      const queryDto = { skip: 0, take: 10 };
      mockPrismaService.member.findMany.mockResolvedValue(members);
      // @ts-ignore - count is also called
      mockPrismaService.member.count = jest.fn().mockResolvedValue(1);

      const result = await service.findAll(gymId, queryDto);

      expect(prisma.member.findMany).toHaveBeenCalled();
      expect(result.members).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a member', async () => {
      const gymId = 1;
      const memberId = 1;
      const member = { id: memberId, firstName: 'John', gymId };
      mockPrismaService.member.findUnique.mockResolvedValue(member);

      const result = await service.findOne(memberId, gymId);

      expect(prisma.member.findUnique).toHaveBeenCalledWith({ where: { id: memberId, gymId } });
      expect(result).toEqual(member);
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a member', async () => {
      const gymId = 1;
      const memberId = 1;
      const member = { id: memberId, firstName: 'John', gymId };
      const dto = { firstName: 'Jane' };
      mockPrismaService.member.findUnique.mockResolvedValue(member);
      mockPrismaService.member.update.mockResolvedValue({ ...member, ...dto });

      const result = await service.update(memberId, gymId, dto);

      expect(prisma.member.update).toHaveBeenCalledWith({
        where: { id: memberId, gymId },
        data: dto,
      });
      expect(result.firstName).toEqual(dto.firstName);
    });
  });

  describe('remove', () => {
    it('should delete a member', async () => {
      const gymId = 1;
      const memberId = 1;
      const member = { id: memberId, firstName: 'John', gymId };
      mockPrismaService.member.findUnique.mockResolvedValue(member);
      mockPrismaService.member.delete.mockResolvedValue(member);

      const result = await service.remove(memberId, gymId);

      expect(prisma.member.delete).toHaveBeenCalledWith({
        where: { id: memberId, gymId }
      });
      expect(result).toEqual(member);
    });
  });

  describe('findExpiredMembers', () => {
    it('should return members whose memberships expired in the last 30 days', async () => {
      const gymId = 1;
      const expiredMembers = [{ id: 1, firstName: 'Expired', lastName: 'Member' }];
      mockPrismaService.member.findMany.mockResolvedValue(expiredMembers);

      const result = await service.findExpiredMembers(gymId);

      expect(prisma.member.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          gymId,
          enrollments: expect.objectContaining({
            some: expect.objectContaining({
              status: 'ACTIVE',
            }),
            none: expect.objectContaining({
              status: 'ACTIVE',
            }),
          }),
        }),
      }));
      expect(result).toEqual(expiredMembers);
    });
  });

  describe('countExpiredMembers', () => {
    it('should return the count of expired members', async () => {
      const gymId = 1;
      // @ts-ignore
      mockPrismaService.member.count = jest.fn().mockResolvedValue(5);

      const result = await service.countExpiredMembers(gymId);

      expect(prisma.member.count).toHaveBeenCalled();
      expect(result).toEqual(5);
    });
  });
});
