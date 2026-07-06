import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { GymsModule } from './gyms/gyms.module';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { PlansModule } from './plans/plans.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [PrismaModule, AuthModule, MembersModule, PlansModule, EnrollmentsModule, PaymentsModule, GymsModule],
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService],
})
export class AppModule {}
