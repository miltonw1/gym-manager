import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MercadoPagoService } from './mercadopago.service';
import { SubscriptionStatus } from '@prisma/client';
import {
  CheckoutResponse,
  SubscriptionHistoryItem,
  SubscriptionPlanResponse,
  SubscriptionStatusResponse,
} from './dto/subscription-responses.dto';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mercadoPago: MercadoPagoService,
  ) {}

  async findPlans(): Promise<SubscriptionPlanResponse[]> {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { active: true },
      orderBy: { days: 'asc' },
    });
    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      days: p.days,
      price: p.price.toString(),
      active: p.active,
    }));
  }

  async getStatus(gymId: number | null): Promise<SubscriptionStatusResponse> {
    if (gymId === null) {
      // Admin global: nunca en modo solo-lectura
      return {
        isReadOnly: false,
        accessUntil: null,
        daysRemaining: Infinity,
        active: true,
      };
    }

    const gym = await this.prisma.gym.findUnique({
      where: { id: gymId },
      select: { accessUntil: true },
    });

    const now = new Date();
    const accessUntil = gym?.accessUntil ?? null;
    const isReadOnly = !accessUntil || accessUntil.getTime() < now.getTime();

    return {
      isReadOnly,
      accessUntil,
      daysRemaining: accessUntil
        ? Math.max(
            0,
            Math.floor((accessUntil.getTime() - now.getTime()) / DAY_MS),
          )
        : 0,
      active: !isReadOnly,
    };
  }

  async getHistory(gymId: number): Promise<SubscriptionHistoryItem[]> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { gymId },
      include: { plan: { select: { name: true, days: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return subscriptions.map((s) => ({
      id: s.id,
      status: s.status,
      amount: s.amount.toString(),
      planName: s.plan?.name ?? null,
      days: s.plan?.days ?? null,
      startDate: s.startDate,
      endDate: s.endDate,
      paidAt: s.paidAt,
      createdAt: s.createdAt,
    }));
  }

  async checkout(
    gymId: number,
    planId: number,
    payerEmail?: string,
  ): Promise<CheckoutResponse> {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.active) {
      throw new NotFoundException('Subscription plan not found');
    }

    const externalReference = `gym-${gymId}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const subscription = await this.prisma.subscription.create({
      data: {
        gymId,
        planId: plan.id,
        status: SubscriptionStatus.PENDING,
        amount: plan.price,
        externalReference,
      },
    });

    let preference;
    try {
      preference = await this.mercadoPago.createPreference({
        planId: String(plan.id),
        planName: plan.name,
        price: Number(plan.price),
        externalReference,
        payerEmail,
      });
    } catch (error) {
      // Si falla la creación de la preferencia, dejamos la suscripción PENDING
      // para permitir reintentar, pero avisamos.
      this.logger.error('Error creating MercadoPago preference', error);
      throw new BadRequestException(
        'No se pudo crear el pago. Intentá nuevamente en unos segundos.',
      );
    }

    return {
      subscriptionId: subscription.id,
      initPoint: preference.initPoint,
      sandboxInitPoint: preference.sandboxInitPoint,
    };
  }

  async handleWebhook(body: any) {
    const type = body?.type || body?.topic;
    const data = body?.data || body;

    if (type !== 'payment' && !data?.id) {
      this.logger.warn('Ignoring non-payment notification', body);
      return { received: true };
    }

    const paymentId = body?.data?.id || body?.id;
    const mpPaymentId =
      typeof paymentId === 'string' ? Number(paymentId) : paymentId;

    try {
      const payment = await this.mercadoPago.getPayment(mpPaymentId);
      const externalReference = payment.external_reference;

      if (!externalReference) {
        this.logger.warn('Payment without external_reference', payment.id);
        return { received: true };
      }

      const subscription = await this.prisma.subscription.findUnique({
        where: { externalReference },
      });

      if (!subscription) {
        this.logger.warn(
          'No subscription for externalReference',
          externalReference,
        );
        return { received: true };
      }

      await this.applyPaymentStatus(
        subscription.id,
        String(payment.id),
        payment.status,
      );

      return { received: true };
    } catch (error) {
      this.logger.error('Error processing webhook', error);
      // Respondemos 200 para no reintentar indefinidamente; el polling manual
      // o un reintento posterior puede completar el flujo.
      return { received: true };
    }
  }

  async verifyPayment(gymId: number, subscriptionId: number) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription || subscription.gymId !== gymId) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === SubscriptionStatus.APPROVED) {
      return { status: SubscriptionStatus.APPROVED };
    }

    if (!subscription.externalReference) {
      throw new BadRequestException('Subscription has no external reference');
    }

    const payments = await this.mercadoPago.findPaymentByExternalReference(
      subscription.externalReference,
    );

    if (payments.length === 0) {
      return { status: subscription.status };
    }

    const payment = payments[0];
    await this.applyPaymentStatus(
      subscription.id,
      String(payment.id),
      payment.status,
    );

    return { status: payment.status };
  }

  private async applyPaymentStatus(
    subscriptionId: number,
    mpPaymentId: string,
    status?: string,
  ) {
    if (status === 'approved') {
      await this.activateSubscription(subscriptionId, mpPaymentId);
      return;
    }

    if (status === 'rejected') {
      const sub = await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
      });
      if (sub && sub.status === SubscriptionStatus.PENDING) {
        await this.prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: SubscriptionStatus.REJECTED,
            mercadoPagoPaymentId: mpPaymentId,
          },
        });
      }
    }
  }

  private async activateSubscription(
    subscriptionId: number,
    mpPaymentId: string,
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      return;
    }

    // Idempotencia: si ya está aprobada, no duplicamos la extensión.
    if (subscription.status === SubscriptionStatus.APPROVED) {
      return;
    }

    const days = subscription.plan?.days ?? 0;
    if (days <= 0) {
      this.logger.warn('Subscription has no days to add', subscriptionId);
      return;
    }

    const now = new Date();
    const gym = await this.prisma.gym.findUnique({
      where: { id: subscription.gymId },
      select: { accessUntil: true },
    });

    const currentAccessUntil = gym?.accessUntil ?? null;
    let baseStart: Date;
    if (currentAccessUntil && currentAccessUntil.getTime() > now.getTime()) {
      // Sumamos días al final de la ventana vigente
      baseStart = currentAccessUntil;
    } else {
      // Vencido (o nunca activo): tomamos el día de hoy
      baseStart = now;
    }

    const newAccessUntil = new Date(baseStart);
    newAccessUntil.setDate(newAccessUntil.getDate() + days);

    await this.prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.APPROVED,
          mercadoPagoPaymentId: mpPaymentId,
          paidAt: now,
          startDate: baseStart,
          endDate: newAccessUntil,
        },
      });

      await tx.gym.update({
        where: { id: subscription.gymId },
        data: { accessUntil: newAccessUntil },
      });
    });
  }
}
