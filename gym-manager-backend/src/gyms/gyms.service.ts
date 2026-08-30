import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { GymResponseDto } from './dto/gym-response.dto';

@Injectable()
export class GymsService {
  constructor(private prisma: PrismaService) {}

  private readonly gymSelect = {
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

  async create(createGymDto: CreateGymDto): Promise<GymResponseDto> {
    const gym = await this.prisma.gym.create({
      data: createGymDto,
      select: this.gymSelect,
    });

    return gym;
  }

  async findAll(): Promise<GymResponseDto[]> {
    return this.prisma.gym.findMany({
      select: this.gymSelect,
    });
  }

  async findOne(id: number): Promise<GymResponseDto> {
    const gym = await this.prisma.gym.findUnique({
      where: { id },
      select: this.gymSelect,
    });

    if (!gym) {
      throw new NotFoundException(`Gym with ID ${id} not found`);
    }

    return gym;
  }

  async update(
    id: number,
    updateGymDto: UpdateGymDto,
  ): Promise<GymResponseDto> {
    await this.findOne(id);

    return this.prisma.gym.update({
      where: { id },
      data: updateGymDto,
      select: this.gymSelect,
    });
  }

  async remove(id: number): Promise<GymResponseDto> {
    await this.findOne(id);

    return this.prisma.gym.delete({
      where: { id },
      select: this.gymSelect,
    });
  }
}
