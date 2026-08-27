import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { SubscriptionsService } from './subscriptions.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  findPlans() {
    return this.subscriptionsService.findPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getStatus(@GetUser('gymId') gymId: number | null) {
    return this.subscriptionsService.getStatus(gymId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  getHistory(@GetUser('gymId') gymId: number | null) {
    if (gymId === null) {
      return [];
    }
    return this.subscriptionsService.getHistory(gymId);
  }

  // MP redirige acá tras el pago. Reenvía al browser al frontend local.
  @Get('return')
  returnToSite(
    @Query('status') status: string,
    @Query('subscriptionId', ParseIntPipe) subscriptionId: number,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const safeStatus = ['success', 'pending', 'failure'].includes(status)
      ? status
      : 'pending';
    res.redirect(
      `${frontendUrl}/billing/result?status=${safeStatus}&subscriptionId=${subscriptionId}`,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('reconcile')
  reconcile(@GetUser('gymId') gymId: number | null) {
    if (gymId === null) {
      return [];
    }
    return this.subscriptionsService.reconcile(gymId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(
    @GetUser('gymId') gymId: number | null,
    @GetUser('email') email: string,
    @Body() createCheckoutDto: CreateCheckoutDto,
  ) {
    if (gymId === null) {
      throw new ForbiddenException('Your account is not associated with a gym');
    }
    return this.subscriptionsService.checkout(
      gymId,
      createCheckoutDto.planId,
      email,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/verify')
  verify(
    @GetUser('gymId') gymId: number | null,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (gymId === null) {
      throw new ForbiddenException('Your account is not associated with a gym');
    }
    return this.subscriptionsService.verifyPayment(gymId, id);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  webhook(@Body() body: any) {
    return this.subscriptionsService.handleWebhook(body);
  }
}
