import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto: CreateUserDto = {
        email: 'test@test.com',
        password: 'password',
      };
      const gymId = 1;
      mockUsersService.create.mockResolvedValue({ id: 1, ...dto, gymId });

      const result = await controller.create(gymId, dto);

      expect(service.create).toHaveBeenCalledWith({ ...dto, gymId });
      expect(result).toHaveProperty('id');
    });
  });

  describe('findAll', () => {
    it('should return all users for a gym', async () => {
      const gymId = 1;
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(gymId);

      expect(service.findAll).toHaveBeenCalledWith(gymId);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const gymId = 1;
      const userId = 1;
      const user = { id: userId, email: 'test@test.com', gymId };
      mockUsersService.findOne.mockResolvedValue(user);

      const result = await controller.findOne(userId, gymId);

      expect(service.findOne).toHaveBeenCalledWith(userId, gymId);
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const gymId = 1;
      const userId = 1;
      const dto: UpdateUserDto = { email: 'new@test.com' };
      mockUsersService.update.mockResolvedValue({ id: userId, gymId, ...dto });

      const result = await controller.update(userId, gymId, dto);

      expect(service.update).toHaveBeenCalledWith(userId, gymId, dto);
      expect(result.email).toEqual(dto.email);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const gymId = 1;
      const userId = 1;
      mockUsersService.remove.mockResolvedValue({ id: userId, gymId });

      const result = await controller.remove(userId, gymId);

      expect(service.remove).toHaveBeenCalledWith(userId, gymId);
      expect(result).toEqual({ id: userId, gymId });
    });
  });
});
