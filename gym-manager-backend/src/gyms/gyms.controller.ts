import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { GymsService } from './gyms.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { GymResponseDto } from './dto/gym-response.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('gyms')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class GymsController {
    constructor(private readonly gymService: GymsService) { }

    @Post()
    create(@Body() createGymDto: CreateGymDto): Promise<GymResponseDto> {
        return this.gymService.create(createGymDto);
    }

    @Get()
    findAll(): Promise<GymResponseDto[]> {
        return this.gymService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<GymResponseDto> {
        return this.gymService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateGymDto: UpdateGymDto,
    ): Promise<GymResponseDto> {
        return this.gymService.update(id, updateGymDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number): Promise<GymResponseDto> {
        return this.gymService.remove(id);
    }
}
