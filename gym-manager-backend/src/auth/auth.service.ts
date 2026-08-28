import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const DAY_MS = 24 * 60 * 60 * 1000;
const TRIAL_DAYS = Number(process.env.TRIAL_DAYS ?? 14);
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
    private mailService: MailService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.usersService.validateUser(email, pass);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      gymId: user.gymId,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.ownerEmail },
    });
    if (existingUser) {
      throw new ConflictException('El email del dueño ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.ownerPassword, 10);
    const accessUntil = new Date(Date.now() + TRIAL_DAYS * DAY_MS);

    const user = await this.prisma.$transaction(async (tx) => {
      const gym = await tx.gym.create({
        data: {
          name: registerDto.gymName,
          street: registerDto.street,
          city: registerDto.city,
          province: registerDto.province,
          phone: registerDto.phone,
          email: registerDto.email,
          accessUntil,
        },
      });

      return tx.user.create({
        data: {
          email: registerDto.ownerEmail,
          gymId: gym.id,
          role: UserRole.ADMIN,
          password: {
            create: { hash: hashedPassword },
          },
        },
      });
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      gymId: user.gymId,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        message:
          'Si el email existe, te enviamos un enlace para restablecer tu contraseña.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      await tx.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailService.sendPasswordResetEmail(user.email, resetUrl);

    return {
      message:
        'Si el email existe, te enviamos un enlace para restablecer tu contraseña.',
    };
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException(
        'El enlace es inválido o ya expiró. Solicita uno nuevo.',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });

      await tx.user.update({
        where: { id: record.userId },
        data: {
          password: {
            upsert: {
              create: { hash: hashedPassword },
              update: { hash: hashedPassword },
            },
          },
        },
      });
    });

    return { message: 'Contraseña actualizada correctamente.' };
  }

  async me(userId: number) {
    const user = await this.usersService.findOne(userId, null);
    const subscription = await this.subscriptionsService.getStatus(user.gymId);
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      gymId: user.gymId,
    };

    let gym: { id: number; name: string } | null = null;
    if (user.gymId !== null) {
      const found = await this.prisma.gym.findUnique({
        where: { id: user.gymId },
        select: { id: true, name: true },
      });
      gym = found;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        gymId: user.gymId,
      },
      gym,
      access_token: await this.jwtService.signAsync(tokenPayload),
      subscription,
    };
  }

  async assertWritableAccess(user: { id: number; gymId: number | null }) {
    if (user.gymId === null) {
      return;
    }
    const status = await this.subscriptionsService.getStatus(user.gymId);
    if (status.isReadOnly) {
      throw new ForbiddenException(
        'Tu suscripción venció. Solo tenés acceso de lectura. Renová para volver a editar tus datos.',
      );
    }
  }
}
