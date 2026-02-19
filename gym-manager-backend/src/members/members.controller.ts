import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, ConflictException } from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberResponseDto } from './dto/member-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  create(
    @GetUser('gymId') tokenGymId: number | null,
    @Body() createMemberDto: CreateMemberDto,
  ): Promise<MemberResponseDto> {
    const finalGymId = tokenGymId ?? createMemberDto.gymId;

    if (!finalGymId) {
      throw new ConflictException('A gymId must be provided for the member');
    }

    return this.membersService.create(finalGymId, createMemberDto);
  }

  @Get()
  findAll(@GetUser('gymId') tokenGymId: number | null): Promise<MemberResponseDto[]> {
    return this.membersService.findAll(tokenGymId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('gymId') tokenGymId: number | null,
  ): Promise<MemberResponseDto> {
    return this.membersService.findOne(id, tokenGymId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('gymId') tokenGymId: number | null,
    @Body() updateMemberDto: UpdateMemberDto,
  ): Promise<MemberResponseDto> {
    return this.membersService.update(id, tokenGymId, updateMemberDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('gymId') tokenGymId: number | null,
  ): Promise<MemberResponseDto> {
    return this.membersService.remove(id, tokenGymId);
  }
}
