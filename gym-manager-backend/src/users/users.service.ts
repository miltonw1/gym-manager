import { Injectable, NotFoundException } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { password, ...userData } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        ...userData,
        password: {
          create: {
            hash: hashedPassword,
          },
        },
      },
      select: {
        id: true,
        email: true,
        gymId: true,
        createdAt: true,
      },
    });
  }

  async findAll(gymId: number): Promise<UserResponseDto[]> {
    return this.prisma.user.findMany({
      where: { gymId },
      select: {
        id: true,
        email: true,
        gymId: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: number, gymId: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id, gymId },
      select: {
        id: true,
        email: true,
        gymId: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found in this gym`);
    }

    return user;
  }

  async update(id: number, gymId: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const { password, ...userData } = updateUserDto;

    // Check if user exists first to throw proper error
    await this.findOne(id, gymId);

    const updateData: any = { ...userData };

    if (password) {
      updateData.password = {
        update: {
          hash: await bcrypt.hash(password, 10),
        },
      };
    }

    return this.prisma.user.update({
      where: { id, gymId },
      data: updateData,
      select: {
        id: true,
        email: true,
        gymId: true,
        createdAt: true,
      },
    });
  }

  async remove(id: number, gymId: number): Promise<UserResponseDto> {
    // Check if user exists first to throw proper error
    await this.findOne(id, gymId);

    return this.prisma.user.delete({
      where: { id, gymId },
      select: {
        id: true,
        email: true,
        gymId: true,
        createdAt: true,
      },
    });
  }
}
