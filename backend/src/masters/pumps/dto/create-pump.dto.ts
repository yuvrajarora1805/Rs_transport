import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreatePumpDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  contactNo?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  openingBalance?: number;
}

