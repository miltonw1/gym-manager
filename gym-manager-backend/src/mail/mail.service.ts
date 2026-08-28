import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private $resend?: Resend;

  private get resend(): Resend {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        'RESEND_API_KEY is not configured. Set it in the environment variables.',
      );
    }
    if (!this.$resend) {
      this.$resend = new Resend(apiKey);
    }
    return this.$resend;
  }

  private get from(): string {
    return process.env.EMAIL_FROM || 'onboarding@resend.dev';
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    if (!process.env.RESEND_API_KEY) {
      // Sin API key (dev): logueamos el enlace en vez de enviar el email.
      this.logger.log(`[Password Reset] ${to} -> ${resetUrl}`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.from,
        to: [to],
        subject: 'Restablecé tu contraseña',
        html: `
          <p>Hola,</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
          <p>Hacé clic en el siguiente enlace para elegir una nueva contraseña:</p>
          <p><a href="${resetUrl}">Restablecer mi contraseña</a></p>
          <p>El enlace es válido por 1 hora. Si no solicitaste esto, podés ignorar este email.</p>
        `,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${to}: ${String(error)}`,
      );
    }
  }
}
