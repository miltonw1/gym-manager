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
  ConflictException,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanResponseDto } from './dto/plan-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  create(
    @GetUser('gymId') tokenGymId: number | null,
    @Body() createPlanDto: CreatePlanDto,
  ): Promise<PlanResponseDto> {
    const finalGymId = tokenGymId ?? createPlanDto.gymId;

    if (!finalGymId) {
      throw new ConflictException('A gymId must be provided for the plan');
    }

    return this.plansService.create(finalGymId, createPlanDto);
  }

  @Get()
  findAll(@GetUser('gymId') tokenGymId: number | null): Promise<PlanResponseDto[]> {
    return this.plansService.findAll(tokenGymId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('gymId') tokenGymId: number | null,
  ): Promise<PlanResponseDto> {
    return this.plansService.findOne(id, tokenGymId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('gymId') tokenGymId: number | null,
    @Body() updatePlanDto: UpdatePlanDto,
  ): Promise<PlanResponseDto> {
    return this.plansService.update(id, tokenGymId, updatePlanDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('gymId') tokenGymId: number | null,
  ): Promise<PlanResponseDto> {
    return this.plansService.remove(id, tokenGymId);
  }
}
