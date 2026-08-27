import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const DAY_MS = 24 * 60 * 60 * 1000;
const TRIAL_DAYS = Number(process.env.TRIAL_DAYS ?? 14);

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
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

  async me(userId: number) {
    const user = await this.usersService.findOne(userId, null);
    const subscription = await this.subscriptionsService.getStatus(user.gymId);
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      gymId: user.gymId,
    };

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        gymId: user.gymId,
      },
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
