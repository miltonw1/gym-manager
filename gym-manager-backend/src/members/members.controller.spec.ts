import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

describe('MembersController', () => {
  let controller: MembersController;
  let service: MembersService;

  const mockMembersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        { provide: MembersService, useValue: mockMembersService },
      ],
    }).compile();

    controller = module.get<MembersController>(MembersController);
    service = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a member', async () => {
      const dto: CreateMemberDto = { 
        firstName: 'John', 
        lastName: 'Doe', 
        dni: '12345678', 
      };
      const gymId = 1;
      mockMembersService.create.mockResolvedValue({ id: 1, ...dto, gymId, joinDate: new Date(), active: true });

      const result = await controller.create(gymId, dto);

      expect(service.create).toHaveBeenCalledWith(gymId, dto);
      expect(result).toHaveProperty('id');
    });
  });

  describe('findAll', () => {
    it('should return all members for a gym', async () => {
      const gymId = 1;
      mockMembersService.findAll.mockResolvedValue([]);
      
      const result = await controller.findAll(gymId);

      expect(service.findAll).toHaveBeenCalledWith(gymId);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a member by id', async () => {
      const gymId = 1;
      const memberId = 1;
      const member = { id: memberId, firstName: 'John', lastName: 'Doe', gymId };
      mockMembersService.findOne.mockResolvedValue(member);

      const result = await controller.findOne(memberId, gymId);

      expect(service.findOne).toHaveBeenCalledWith(memberId, gymId);
      expect(result).toEqual(member);
    });
  });

  describe('update', () => {
    it('should update a member', async () => {
      const gymId = 1;
      const memberId = 1;
      const dto: UpdateMemberDto = { firstName: 'Jane' };
      mockMembersService.update.mockResolvedValue({ id: memberId, gymId, ...dto });

      const result = await controller.update(memberId, gymId, dto);

      expect(service.update).toHaveBeenCalledWith(memberId, gymId, dto);
      expect(result.firstName).toEqual(dto.firstName);
    });
  });

  describe('remove', () => {
    it('should remove a member', async () => {
      const gymId = 1;
      const memberId = 1;
      mockMembersService.remove.mockResolvedValue({ id: memberId, gymId });

      const result = await controller.remove(memberId, gymId);

      expect(service.remove).toHaveBeenCalledWith(memberId, gymId);
      expect(result).toEqual({ id: memberId, gymId });
    });
  });
});
