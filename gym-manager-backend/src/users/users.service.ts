import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private readonly userSelect = {
    id: true,
    email: true,
    gymId: true,
    role: true,
    createdAt: true,
  };

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
      select: this.userSelect,
    });
  }

  async findAll(gymId: number | null): Promise<UserResponseDto[]> {
    const where: any = {};
    if (gymId !== null) {
      where.gymId = gymId;
    }
    
    return this.prisma.user.findMany({
      where,
      select: this.userSelect,
    });
  }

  async findOne(id: number, gymId: number | null): Promise<UserResponseDto> {
    const where: any = { id };
    if (gymId !== null) {
      where.gymId = gymId;
    }

    const user = await this.prisma.user.findUnique({
      where,
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: number, gymId: number | null, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
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

    const where: any = { id };
    if (gymId !== null) {
      where.gymId = gymId;
    }

    return this.prisma.user.update({
      where,
      data: updateData,
      select: this.userSelect,
    });
  }

  async remove(id: number, gymId: number | null): Promise<UserResponseDto> {
    // Check if user exists first to throw proper error
    await this.findOne(id, gymId);

    const where: any = { id };
    if (gymId !== null) {
      where.gymId = gymId;
    }

    return this.prisma.user.delete({
      where,
      select: this.userSelect,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        password: true,
      },
    });
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.findByEmail(email);
    if (user && user.password) {
      const isMatch = await bcrypt.compare(pass, user.password.hash);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }
}
