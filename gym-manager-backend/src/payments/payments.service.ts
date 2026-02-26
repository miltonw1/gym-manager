import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenue(gymId: number | null, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month !== undefined ? Number(month) : now.getMonth() + 1;
    const targetYear = year !== undefined ? Number(year) : now.getFullYear();

    // Crear rango de fechas para el mes
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const payments = await this.prisma.payment.findMany({
      where: {
        enrollment: {
          member: gymId ? { gymId: Number(gymId) } : {},
        },
        paidAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        enrollment: {
          select: {
            member: { select: { firstName: true, lastName: true, dni: true } },
            plan: { select: { name: true } },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      month: targetMonth,
      year: targetYear,
      totalRevenue,
      transactionCount: payments.length,
      details: payments.map(p => ({
        id: p.id,
        amount: p.amount,
        paidAt: p.paidAt,
        member: `${p.enrollment.member.firstName} ${p.enrollment.member.lastName}`,
        dni: p.enrollment.member.dni,
        plan: p.enrollment.plan.name,
      })),
    };
  }
}
