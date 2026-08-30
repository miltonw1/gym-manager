import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PaymentsService, RevenuePeriod } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

const VALID_PERIODS: RevenuePeriod[] = ['month', 'year', 'all'];

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('revenue')
  getRevenue(
    @GetUser('gymId') gymId: number | null,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.paymentsService.getRevenue(gymId, month, year);
  }

  @Get('revenue-by-plan')
  getRevenueByPlan(
    @GetUser('gymId') gymId: number | null,
    @Query('period') period?: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    const validPeriod: RevenuePeriod = VALID_PERIODS.includes(
      period as RevenuePeriod,
    )
      ? (period as RevenuePeriod)
      : 'month';
    return this.paymentsService.getRevenueByPlan(
      gymId,
      validPeriod,
      month,
      year,
    );
  }
}
