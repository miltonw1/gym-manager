import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';

export class CreateMemberDto {
  @IsNumber()
  @IsOptional()
  gymId?: number;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  dni: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  phone?: string;

  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  email?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
