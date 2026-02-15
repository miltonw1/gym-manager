import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
  //   return this.usersService.create(createUserDto);
  // }

  @Get()
  findAll(@Query('gymId') gymId: string): Promise<UserResponseDto[]> {
    return this.usersService.findAll(+gymId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('gymId') gymId: string,
  ): Promise<UserResponseDto> {
    return this.usersService.findOne(+id, +gymId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('gymId') gymId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(+id, +gymId, updateUserDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('gymId') gymId: string,
  ): Promise<UserResponseDto> {
    return this.usersService.remove(+id, +gymId);
  }
}
