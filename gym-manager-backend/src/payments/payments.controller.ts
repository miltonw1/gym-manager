import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

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
}
