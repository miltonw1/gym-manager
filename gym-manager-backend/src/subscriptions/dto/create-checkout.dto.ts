import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateCheckoutDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  planId: number;
}
