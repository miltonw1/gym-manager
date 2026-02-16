import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Por defecto si no se especifica rol, es STAFF
    if (!createUserDto.role) {
      createUserDto.role = UserRole.STAFF;
    }
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query('gymId', ParseIntPipe) gymId: number): Promise<UserResponseDto[]> {
    return this.usersService.findAll(gymId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN) // Temporalmente solo ADMIN, después permitir STAFF ver su info
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('gymId', ParseIntPipe) gymId: number,
  ): Promise<UserResponseDto> {
    return this.usersService.findOne(id, gymId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Query('gymId', ParseIntPipe) gymId: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, gymId, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('gymId', ParseIntPipe) gymId: number,
  ): Promise<UserResponseDto> {
    return this.usersService.remove(id, gymId);
  }
}
