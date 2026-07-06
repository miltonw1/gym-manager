import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberResponseDto } from './dto/member-response.dto';
import { GetMembersQueryDto, MemberFilterStatus } from './dto/get-members-query.dto';

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

  async findAll(gymId: number | null, queryDto: GetMembersQueryDto) {
    const { skip = 0, take = 10, search, status } = queryDto;
    
    const where: any = {};
    if (gymId !== null) {
      where.gymId = gymId;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== MemberFilterStatus.ALL) {
      const now = new Date();
      if (status === MemberFilterStatus.EXPIRED) {
        where.enrollments = {
          some: { endDate: { lt: now } },
          none: { endDate: { gte: now }, status: 'ACTIVE' },
        };
      } else if (status === MemberFilterStatus.ACTIVE) {
        where.enrollments = {
          some: { endDate: { gte: now }, status: 'ACTIVE' },
        };
      } else if (status === MemberFilterStatus.INACTIVE) {
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(now.getMonth() - 2);
        where.enrollments = {
            none: { endDate: { gte: twoMonthsAgo } }
        };
      }
    }

    const [total, members] = await Promise.all([
      this.prisma.member.count({ where }),
      this.prisma.member.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        include: {
          enrollments: {
            where: { status: 'ACTIVE' },
            orderBy: { endDate: 'desc' },
            select: { endDate: true }
          }
        },
        orderBy: { lastName: 'asc' },
      }),
    ]);

    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);

    return {
      total,
      skip: Number(skip),
      take: Number(take),
      members: members.map(m => {
        const activeEnrollments = m.enrollments.filter(e => new Date(e.endDate) >= now);
        const expiredEnrollments = m.enrollments.filter(e => new Date(e.endDate) < now);
        const hasActive = activeEnrollments.length > 0;

        const sortedDesc = [...m.enrollments].sort((a, b) =>
          new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
        );
        const lastExpiry = sortedDesc[0]?.endDate || null;

        const sortedAsc = [...activeEnrollments].sort((a, b) =>
          new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        );
        const nearestExpiry = sortedAsc[0]?.endDate || null;

        const isExpiringSoon = hasActive && nearestExpiry && new Date(nearestExpiry) <= sevenDaysFromNow;

        let status: string;
        if (m.enrollments.length === 0) {
          status = 'NO_PLAN';
        } else if (!hasActive) {
          status = 'EXPIRED';
        } else if (isExpiringSoon) {
          status = 'EXPIRING_SOON';
        } else {
          status = 'ACTIVE';
        }

        return {
          ...m,
          status,
          nextExpiryDate: lastExpiry,
          nearestExpiryDate: nearestExpiry,
          expiredEnrollmentCount: expiredEnrollments.length,
          enrollments: undefined
        };
      }),
    };
  }

  async findOne(id: number, gymId: number | null): Promise<MemberResponseDto> {
    const where: any = { id };
    if (gymId !== null) {
      where.gymId = gymId;
    }

    const member = await this.prisma.member.findFirst({
      where,
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    return member;
  }

  async update(id: number, gymId: number | null, updateMemberDto: UpdateMemberDto): Promise<MemberResponseDto> {
    await this.findOne(id, gymId);

    return this.prisma.member.update({
      where: { id },
      data: updateMemberDto,
    });
  }

  async remove(id: number, gymId: number | null): Promise<MemberResponseDto> {
    await this.findOne(id, gymId);

    return this.prisma.member.delete({
      where: { id },
    });
  }

  async findRecentlyExpiredMembers(gymId: number, search?: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const where: any = {
      gymId,
      enrollments: {
        some: {
          endDate: {
            lt: now,
            gte: thirtyDaysAgo,
          },
        },
        none: { endDate: { gte: now }, status: 'ACTIVE' },
      },
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.member.findMany({
      where,
      include: {
        enrollments: {
          where: {
            endDate: { lt: now, gte: thirtyDaysAgo },
          },
          orderBy: { endDate: 'desc' },
          include: {
            plan: true,
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async countRecentlyExpiredMembers(gymId: number) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    return this.prisma.member.count({
      where: {
        gymId,
        enrollments: {
          some: {
            endDate: {
              lt: now,
              gte: thirtyDaysAgo,
            },
          },
          none: { endDate: { gte: now }, status: 'ACTIVE' },
        },
      },
    });
  }
}
