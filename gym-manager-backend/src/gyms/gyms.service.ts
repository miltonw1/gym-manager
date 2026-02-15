import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { GymResponseDto } from './dto/gym-response.dto';


export class GymsService {
    constructor(private prisma: PrismaService) { }

    async create(createGymDto: CreateGymDto): Promise<GymResponseDto> {
        const gym = await this.prisma.gym.create({
            data: createGymDto, // ya no hace falta el spread innecesario
            select: {
                id: true,
                name: true,
                street: true,
                city: true,
                province: true,
                country: true,
                phone: true,
                email: true,
                createdAt: true,
            },
        });

        return gym;
    }
}
