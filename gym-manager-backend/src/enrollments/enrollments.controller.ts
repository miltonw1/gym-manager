import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { EnrollmentResponseDto } from './dto/enrollment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  create(
    @GetUser('gymId') gymId: number | null,
    @Body() createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<EnrollmentResponseDto> {
    return this.enrollmentsService.create(gymId, createEnrollmentDto);
  }

  @Get()
  findAll(
    @GetUser('gymId') gymId: number | null,
  ): Promise<EnrollmentResponseDto[]> {
    return this.enrollmentsService.findAll(gymId);
  }

  @Get('member/:memberId')
  findByMember(
    @Param('memberId', ParseIntPipe) memberId: number,
    @GetUser('gymId') gymId: number | null,
  ): Promise<EnrollmentResponseDto[]> {
    return this.enrollmentsService.findByMember(memberId, gymId);
  }

  @Get('expiring')
  findExpiring(
    @GetUser('gymId') gymId: number | null,
    @Query('days') days?: number,
  ): Promise<EnrollmentResponseDto[]> {
    return this.enrollmentsService.findExpiring(gymId, days);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('gymId') gymId: number | null,
  ): Promise<EnrollmentResponseDto> {
    return this.enrollmentsService.findOne(id, gymId);
  }

  @Post(':id/renew')
  renew(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('gymId') gymId: number | null,
  ): Promise<EnrollmentResponseDto> {
    return this.enrollmentsService.renew(gymId, id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('gymId') gymId: number | null,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<EnrollmentResponseDto> {
    return this.enrollmentsService.update(id, gymId, updateEnrollmentDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('gymId') gymId: number | null,
  ): Promise<EnrollmentResponseDto> {
    return this.enrollmentsService.remove(id, gymId);
  }
}
