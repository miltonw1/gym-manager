import { Test, TestingModule } from '@nestjs/testing';
import { GymsController } from './gyms.controller';
import { GymsService } from './gyms.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { GymResponseDto } from './dto/gym-response.dto';

describe('GymsController', () => {
  let controller: GymsController;
  let service: GymsService;

  const mockGymsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const gymResponse: GymResponseDto = {
    id: 1,
    name: 'Test Gym',
    street: '123 Test St',
    city: 'Test City',
    province: 'Test Province',
    country: 'Argentina',
    phone: '123456789',
    email: 'gym@test.com',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GymsController],
      providers: [
        { provide: GymsService, useValue: mockGymsService },
      ],
    }).compile();

    controller = module.get<GymsController>(GymsController);
    service = module.get<GymsService>(GymsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a gym', async () => {
      const createGymDto: CreateGymDto = {
        name: 'Test Gym',
        street: '123 Test St',
        city: 'Test City',
        province: 'Test Province',
        country: 'Argentina',
        phone: '123456789',
        email: 'gym@test.com',
      };
      mockGymsService.create.mockResolvedValue(gymResponse);

      const result = await controller.create(createGymDto);

      expect(service.create).toHaveBeenCalledWith(createGymDto);
      expect(result).toEqual(gymResponse);
    });
  });

  describe('findAll', () => {
    it('should return an array of gyms', async () => {
      const gyms = [gymResponse];
      mockGymsService.findAll.mockResolvedValue(gyms);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(gyms);
    });
  });

  describe('findOne', () => {
    it('should return a single gym', async () => {
      mockGymsService.findOne.mockResolvedValue(gymResponse);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(gymResponse);
    });
  });

  describe('update', () => {
    it('should update a gym', async () => {
      const updateGymDto: UpdateGymDto = { name: 'Updated Gym' };
      const updatedGym = { ...gymResponse, name: 'Updated Gym' };
      mockGymsService.update.mockResolvedValue(updatedGym);

      const result = await controller.update(1, updateGymDto);

      expect(service.update).toHaveBeenCalledWith(1, updateGymDto);
      expect(result).toEqual(updatedGym);
    });
  });

  describe('remove', () => {
    it('should remove a gym', async () => {
      mockGymsService.remove.mockResolvedValue(gymResponse);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(gymResponse);
    });
  });
});
