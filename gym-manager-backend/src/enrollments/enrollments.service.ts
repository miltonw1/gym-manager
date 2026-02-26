import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { EnrollmentResponseDto } from './dto/enrollment-response.dto';
import { EnrollmentStatus } from '@prisma/client';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(gymId: number | null, createEnrollmentDto: CreateEnrollmentDto): Promise<EnrollmentResponseDto> {
    const { memberId, planId, startDate: startDateStr } = createEnrollmentDto;

    // 1. Obtener el miembro y el plan
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });

    if (!member) throw new NotFoundException(`Member with ID ${memberId} not found`);
    if (!plan) throw new NotFoundException(`Plan with ID ${planId} not found`);

    // 2. SEGURIDAD: Validar que el usuario tenga acceso al gimnasio del socio y del plan
    if (gymId !== null) {
      if (member.gymId !== gymId || plan.gymId !== gymId) {
        throw new ForbiddenException('You do not have access to this member or plan');
      }
    }

    // 3. SEGURIDAD EXTRA: El socio y el plan DEBEN ser del mismo gimnasio siempre
    if (member.gymId !== plan.gymId) {
      throw new BadRequestException('The member and the plan must belong to the same gym');
    }

    // 4. Lógica de Fechas (Encadenamiento Automático / Renovación)
    let startDate = startDateStr ? new Date(startDateStr) : new Date();

    // Buscar si ya tiene una inscripción activa que venza después de "ahora"
    const lastEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        memberId,
        status: EnrollmentStatus.ACTIVE,
        endDate: { gt: new Date() },
      },
      orderBy: { endDate: 'desc' },
    });

    if (lastEnrollment && !startDateStr) {
      // Si no se especificó una fecha de inicio manual y hay una activa, encadenamos
      startDate = new Date(lastEnrollment.endDate);
    }

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + plan.durationDays);

    // 5. Crear Enrollment y Payment en una transacción
    return this.prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.create({
        data: {
          memberId,
          planId,
          startDate,
          endDate,
          status: EnrollmentStatus.ACTIVE,
        },
        include: {
          member: {
            select: { firstName: true, lastName: true, dni: true }
          },
          plan: {
            select: { name: true, price: true, durationDays: true }
          }
        }
      });

      // Crear el registro de pago
      await tx.payment.create({
        data: {
          enrollmentId: enrollment.id,
          amount: plan.price,
        },
      });

      return enrollment;
    });
  }

  async findAll(gymId: number | null): Promise<EnrollmentResponseDto[]> {
    return this.prisma.enrollment.findMany({
      where: {
        member: gymId ? { gymId: Number(gymId) } : {},
      },
      include: {
        member: { select: { firstName: true, lastName: true, dni: true } },
        plan: { select: { name: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByMember(memberId: number, gymId: number | null): Promise<EnrollmentResponseDto[]> {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    if (gymId && member.gymId !== gymId) {
      throw new ForbiddenException('You do not have access to this member');
    }

    return this.prisma.enrollment.findMany({
      where: { memberId },
      include: {
        plan: true,
        member: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findExpiring(gymId: number | null, days: number = 7): Promise<EnrollmentResponseDto[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + Number(days));

    return this.prisma.enrollment.findMany({
      where: {
        member: gymId ? { gymId: Number(gymId) } : {},
        status: EnrollmentStatus.ACTIVE,
        endDate: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        member: { select: { firstName: true, lastName: true, dni: true } },
        plan: { select: { name: true, price: true } },
      },
      orderBy: { endDate: 'asc' },
    });
  }

  async findOne(id: number, gymId: number | null): Promise<EnrollmentResponseDto> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        member: true,
        plan: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    if (gymId && enrollment.member.gymId !== gymId) {
      throw new ForbiddenException('You do not have access to this enrollment');
    }

    return enrollment;
  }

  async update(id: number, gymId: number | null, updateEnrollmentDto: UpdateEnrollmentDto): Promise<EnrollmentResponseDto> {
    const current = await this.findOne(id, gymId);

    // Si se actualiza el plan, recalcular la fecha de fin
    let { endDate } = current;
    if (updateEnrollmentDto.planId && updateEnrollmentDto.planId !== current.planId) {
        const newPlan = await this.prisma.plan.findUnique({ where: { id: updateEnrollmentDto.planId } });
        if (!newPlan) throw new NotFoundException('New plan not found');
        
        endDate = new Date(updateEnrollmentDto.startDate ? new Date(updateEnrollmentDto.startDate) : current.startDate);
        endDate.setDate(endDate.getDate() + newPlan.durationDays);
    }

    return this.prisma.enrollment.update({
      where: { id },
      data: {
        ...updateEnrollmentDto,
        endDate,
      },
      include: {
        member: true,
        plan: true,
      },
    });
  }

  async remove(id: number, gymId: number | null): Promise<EnrollmentResponseDto> {
    await this.findOne(id, gymId);

    return this.prisma.enrollment.update({
      where: { id },
      data: { status: EnrollmentStatus.CANCELED },
    });
  }
}
