import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTransporterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  contactNo?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

