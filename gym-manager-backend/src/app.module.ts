import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { GymsController } from './gyms/gyms.controller';
import { GymsService } from './gyms/gyms.service';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { PlansModule } from './plans/plans.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';

@Module({
  imports: [PrismaModule, AuthModule, MembersModule, PlansModule, EnrollmentsModule],
  controllers: [AppController, UsersController, GymsController],
  providers: [AppService, UsersService, GymsService],
})
export class AppModule {}
