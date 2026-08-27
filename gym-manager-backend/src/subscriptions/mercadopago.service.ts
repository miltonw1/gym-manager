import { Injectable, Logger } from '@nestjs/common';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

export interface CreatePreferenceInput {
  planId: string;
  planName: string;
  price: number;
  externalReference: string;
  payerEmail?: string;
}

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private $preference?: Preference;
  private $payment?: Payment;

  private get config(): MercadoPagoConfig {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error(
        'MERCADO_PAGO_ACCESS_TOKEN is not configured. Set it in the environment variables.',
      );
    }
    return new MercadoPagoConfig({ accessToken });
  }

  private get preference(): Preference {
    if (!this.$preference) {
      this.$preference = new Preference(this.config);
    }
    return this.$preference;
  }

  private get payment(): Payment {
    if (!this.$payment) {
      this.$payment = new Payment(this.config);
    }
    return this.$payment;
  }

  async createPreference(input: CreatePreferenceInput): Promise<{
    initPoint: string;
    sandboxInitPoint?: string;
    preferenceId: string;
  }> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const notificationUrl = process.env.MERCADO_PAGO_WEBHOOK_URL;

    const response = await this.preference.create({
      body: {
        items: [
          {
            id: input.planId,
            title: input.planName,
            quantity: 1,
            unit_price: input.price,
            currency_id: 'ARS',
          },
        ],
        external_reference: input.externalReference,
        ...(notificationUrl ? { notification_url: notificationUrl } : {}),
        ...(input.payerEmail
          ? {
              payer: {
                email: input.payerEmail,
              },
            }
          : {}),
        back_urls: {
          success: `${frontendUrl}/billing/result?status=success`,
          pending: `${frontendUrl}/billing/result?status=pending`,
          failure: `${frontendUrl}/billing/result?status=failure`,
        },
        statement_descriptor: 'GYM MANAGER',
      },
    });

    const initPoint = response.init_point || '';
    return {
      initPoint,
      sandboxInitPoint: response.sandbox_init_point,
      preferenceId: response.id || '',
    };
  }

  async getPayment(paymentId: string | number) {
    return this.payment.get({ id: paymentId });
  }

  async findPaymentByExternalReference(
    externalReference: string,
  ): Promise<
    Array<{ id?: string; status?: string; external_reference?: string }>
  > {
    const response = await this.payment.search({
      options: { external_reference: externalReference },
    });
    return response.results || [];
  }
}
