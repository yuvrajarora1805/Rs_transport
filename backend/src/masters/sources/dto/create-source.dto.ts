import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  contactNo?: string;
}

