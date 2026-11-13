import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePartyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  contactNo?: string;

  @IsString()
  @IsOptional()
  destinationId?: string;
}

