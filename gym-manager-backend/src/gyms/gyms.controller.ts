import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { GymsService } from './gyms.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { GymResponseDto } from './dto/gym-response.dto';

@Controller('gyms')
export class GymsController {
    constructor(private readonly gymService: GymsService) { }

    @Post()
    create(@Body() createGymDto: CreateGymDto): Promise<GymResponseDto> {
        return this.gymService.create(createGymDto);
    }


}
