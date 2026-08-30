import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type RevenuePeriod = 'month' | 'year' | 'all';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  private getMonthRange(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }

  private getPreviousMonth(month: number, year: number) {
    if (month === 1) {
      return { month: 12, year: year - 1 };
    }
    return { month: month - 1, year };
  }

  private buildEnrollmentWhere(
    gymId: number | null,
    paidAt?: { gte: Date; lte: Date },
  ) {
    return {
      ...(gymId ? { enrollment: { member: { gymId: Number(gymId) } } } : {}),
      ...(paidAt ? { paidAt } : {}),
    };
  }

  async getRevenue(gymId: number | null, month?: number, year?: number) {
    const now = new Date();
    const targetMonth =
      month !== undefined ? Number(month) : now.getMonth() + 1;
    const targetYear = year !== undefined ? Number(year) : now.getFullYear();

    const { startDate, endDate } = this.getMonthRange(targetMonth, targetYear);
    const { month: prevMonth, year: prevYear } = this.getPreviousMonth(
      targetMonth,
      targetYear,
    );
    const prevRange = this.getMonthRange(prevMonth, prevYear);

    const [payments, prevPayments] = await Promise.all([
      this.prisma.payment.findMany({
        where: this.buildEnrollmentWhere(gymId, {
          gte: startDate,
          lte: endDate,
        }),
        include: {
          enrollment: {
            select: {
              member: {
                select: { firstName: true, lastName: true, dni: true },
              },
              plan: { select: { name: true } },
            },
          },
        },
        orderBy: { paidAt: 'desc' },
      }),
      this.prisma.payment.findMany({
        where: this.buildEnrollmentWhere(gymId, {
          gte: prevRange.startDate,
          lte: prevRange.endDate,
        }),
        select: { amount: true },
      }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const previousTotal = prevPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    const changePercent =
      previousTotal === 0 && totalRevenue === 0
        ? 0
        : previousTotal === 0
          ? null
          : ((totalRevenue - previousTotal) / previousTotal) * 100;

    return {
      month: targetMonth,
      year: targetYear,
      totalRevenue,
      transactionCount: payments.length,
      previousMonth: {
        month: prevMonth,
        year: prevYear,
        totalRevenue: previousTotal,
        transactionCount: prevPayments.length,
      },
      changePercent,
      details: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        paidAt: p.paidAt,
        member: `${p.enrollment.member.firstName} ${p.enrollment.member.lastName}`,
        dni: p.enrollment.member.dni,
        plan: p.enrollment.plan.name,
      })),
    };
  }

  async getRevenueByPlan(
    gymId: number | null,
    period: RevenuePeriod = 'month',
    month?: number,
    year?: number,
  ) {
    const now = new Date();
    const targetMonth =
      month !== undefined ? Number(month) : now.getMonth() + 1;
    const targetYear = year !== undefined ? Number(year) : now.getFullYear();

    let paidAt: { gte: Date; lte: Date } | undefined;
    let respMonth: number | undefined;
    let respYear: number | undefined;

    if (period === 'month') {
      const range = this.getMonthRange(targetMonth, targetYear);
      paidAt = { gte: range.startDate, lte: range.endDate };
      respMonth = targetMonth;
      respYear = targetYear;
    } else if (period === 'year') {
      paidAt = {
        gte: new Date(targetYear, 0, 1),
        lte: new Date(targetYear, 11, 31, 23, 59, 59, 999),
      };
      respYear = targetYear;
    }
    // period === 'all' => paidAt remains undefined (no date filter)

    const payments = await this.prisma.payment.findMany({
      where: this.buildEnrollmentWhere(gymId, paidAt),
      include: {
        enrollment: {
          select: {
            plan: { select: { name: true } },
          },
        },
      },
    });

    const aggregated = new Map<string, { total: number; count: number }>();
    for (const payment of payments) {
      const planName = payment.enrollment.plan.name;
      const current = aggregated.get(planName) ?? { total: 0, count: 0 };
      current.total += Number(payment.amount);
      current.count += 1;
      aggregated.set(planName, current);
    }

    const items = Array.from(aggregated.entries())
      .map(([planName, data]) => ({
        planName,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      period,
      month: respMonth,
      year: respYear,
      items,
      totalRevenue: items.reduce((sum, i) => sum + i.total, 0),
    };
  }
}
