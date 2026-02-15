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
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto: CreateUserDto = { email: 'test@test.com', password: 'password', gymId: 1 };
      mockUsersService.create.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('id');
    });
  });

  describe('findAll', () => {
    it('should return all users for a gym', async () => {
      mockUsersService.findAll.mockResolvedValue([]);
      
      const result = await controller.findAll('1');

      expect(service.findAll).toHaveBeenCalledWith(1);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: 1, email: 'test@test.com', gymId: 1 };
      mockUsersService.findOne.mockResolvedValue(user);

      const result = await controller.findOne('1', '1');

      expect(service.findOne).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const dto: UpdateUserDto = { email: 'new@test.com' };
      mockUsersService.update.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.update('1', '1', dto);

      expect(service.update).toHaveBeenCalledWith(1, 1, dto);
      expect(result.email).toEqual(dto.email);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUsersService.remove.mockResolvedValue({ id: 1 });

      const result = await controller.remove('1', '1');

      expect(service.remove).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual({ id: 1 });
    });
  });
});
