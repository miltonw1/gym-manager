import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, from, mergeMap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Interceptor de acceso por suscripción.
 *
 * Después de la autenticación (los guards de JWT ya poblaron `req.user`),
 * este interceptor bloquea las operaciones de ESCRITURA cuando el gimnasio
 * del usuario está fuera de pago (sin "días de uso"), dejando permitidas
 * las lecturas (GET).
 *
 * - Endpoints públicos (sin `req.user`) → se omite.
 * - Admin global (`gymId === null`) → nunca en modo solo-lectura.
 * - Rutas de `/subscriptions` → siempre permitidas (para poder pagar).
 */
@Injectable()
export class SubscriptionAccessInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Endpoints públicos: no hay usuario autenticado
    if (!user) {
      return next.handle();
    }

    // Admin global: nunca bloqueado
    if (user.gymId === null || user.gymId === undefined) {
      return next.handle();
    }

    // Los métodos de lectura siempre están permitidos
    const method = request.method?.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return next.handle();
    }

    // El módulo de suscripción siempre debe poder operar (pagar)
    const path: string = request.originalUrl || request.url || '';
    if (path.startsWith('/subscriptions')) {
      return next.handle();
    }

    // Para operaciones de escritura, verificamos la ventana de uso del gimnasio.
    return from(this.assertWritable(user.gymId)).pipe(
      mergeMap(() => next.handle()),
    );
  }

  private async assertWritable(gymId: number) {
    const gym = await this.prisma.gym.findUnique({
      where: { id: gymId },
      select: { accessUntil: true },
    });

    const accessUntil = gym?.accessUntil ?? null;
    const isReadOnly = !accessUntil || accessUntil.getTime() < Date.now();

    if (isReadOnly) {
      throw new ForbiddenException(
        'Tu suscripción venció. Solo tenés acceso de lectura. Renová para volver a editar tus datos.',
      );
    }
  }
}
