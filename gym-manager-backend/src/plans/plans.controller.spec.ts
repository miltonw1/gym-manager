import { Test, TestingModule } from '@nestjs/testing';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Prisma } from '@prisma/client';
import { ConflictException } from '@nestjs/common';

describe('PlansController', () => {
  let controller: PlansController;
  let service: PlansService;

  const mockPlansService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlansController],
      providers: [{ provide: PlansService, useValue: mockPlansService }],
    }).compile();

    controller = module.get<PlansController>(PlansController);
    service = module.get<PlansService>(PlansService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a plan using gymId from token', async () => {
      const tokenGymId = 1;
      const dto: CreatePlanDto = { name: 'Monthly', price: 100 };
      const expectedResult = {
        id: 1,
        ...dto,
        gymId: tokenGymId,
        price: new Prisma.Decimal(100),
      };
      mockPlansService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(tokenGymId, dto);

      expect(service.create).toHaveBeenCalledWith(tokenGymId, dto);
      expect(result).toEqual(expectedResult);
    });

    it('should create a plan using gymId from DTO if token gymId is null', async () => {
      const tokenGymId = null;
      const dto: CreatePlanDto = { name: 'Monthly', price: 100, gymId: 2 };
      const expectedResult = { id: 1, ...dto, price: new Prisma.Decimal(100) };
      mockPlansService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(tokenGymId, dto);

      expect(service.create).toHaveBeenCalledWith(2, dto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw ConflictException if no gymId is provided', () => {
      const dto: CreatePlanDto = { name: 'Monthly', price: 100 };

      expect(() => controller.create(null, dto)).toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all plans', async () => {
      const gymId = 1;
      const expectedResult = [{ id: 1, name: 'Plan 1' }];
      mockPlansService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(gymId);

      expect(service.findAll).toHaveBeenCalledWith(gymId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a plan by id', async () => {
      const id = 1;
      const gymId = 1;
      const expectedResult = { id, name: 'Plan 1' };
      mockPlansService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id, gymId);

      expect(service.findOne).toHaveBeenCalledWith(id, gymId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a plan', async () => {
      const id = 1;
      const gymId = 1;
      const dto: UpdatePlanDto = { name: 'Plan Updated' };
      const expectedResult = { id, ...dto };
      mockPlansService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, gymId, dto);

      expect(service.update).toHaveBeenCalledWith(id, gymId, dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a plan', async () => {
      const id = 1;
      const gymId = 1;
      const expectedResult = { id, active: false };
      mockPlansService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id, gymId);

      expect(service.remove).toHaveBeenCalledWith(id, gymId);
      expect(result).toEqual(expectedResult);
    });
  });
});
