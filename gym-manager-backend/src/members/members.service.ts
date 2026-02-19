import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberResponseDto } from './dto/member-response.dto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(gymId: number, createMemberDto: CreateMemberDto): Promise<MemberResponseDto> {
    const existingMember = await this.prisma.member.findUnique({
      where: {
        gymId_dni: {
          gymId,
          dni: createMemberDto.dni,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException(`Member with DNI ${createMemberDto.dni} already exists in this gym`);
    }

    const { gymId: dtoGymId, ...memberData } = createMemberDto;

    return this.prisma.member.create({
      data: {
        ...memberData,
        gymId,
      },
    });
  }

  async findAll(gymId: number | null): Promise<MemberResponseDto[]> {
    const where: any = {};
    if (gymId !== null) {
      where.gymId = gymId;
    }
    return this.prisma.member.findMany({
      where,
    });
  }

  async findOne(id: number, gymId: number | null): Promise<MemberResponseDto> {
    const where: any = { id };
    if (gymId !== null) {
      where.gymId = gymId;
    }

    const member = await this.prisma.member.findUnique({
      where,
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    return member;
  }

  async update(id: number, gymId: number | null, updateMemberDto: UpdateMemberDto): Promise<MemberResponseDto> {
    await this.findOne(id, gymId);

    const where: any = { id };
    if (gymId !== null) {
      where.gymId = gymId;
    }

    return this.prisma.member.update({
      where,
      data: updateMemberDto,
    });
  }

  async remove(id: number, gymId: number | null): Promise<MemberResponseDto> {
    await this.findOne(id, gymId);

    const where: any = { id };
    if (gymId !== null) {
      where.gymId = gymId;
    }

    return this.prisma.member.delete({
      where,
    });
  }
}
