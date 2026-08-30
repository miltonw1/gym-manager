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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @GetUser('gymId') tokenGymId: number | null,
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    // Lógica de seguridad:
    // 1. Si el token tiene gymId (Staff/Admin de sucursal), lo forzamos.
    // 2. Si el token NO tiene gymId (Admin Global), usamos el del DTO.
    const finalGymId = tokenGymId ?? createUserDto.gymId;

    if (!createUserDto.role) {
      createUserDto.role = UserRole.STAFF;
    }

    return this.usersService.create({ ...createUserDto, gymId: finalGymId });
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(
    @GetUser('gymId') tokenGymId: number | null,
  ): Promise<UserResponseDto[]> {
    // Para listar, si es Admin Global (null) y no se pasa gymId,
    // tal vez queramos todos, pero por ahora mantenemos la consistencia.
    // Nota: El servicio findAll espera un number, así que si es null,
    // fallará a menos que lo manejemos.
    return this.usersService.findAll(tokenGymId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('gymId') tokenGymId: number | null,
  ): Promise<UserResponseDto> {
    return this.usersService.findOne(id, tokenGymId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('gymId') tokenGymId: number | null,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, tokenGymId, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('gymId') tokenGymId: number | null,
  ): Promise<UserResponseDto> {
    return this.usersService.remove(id, tokenGymId);
  }
}
