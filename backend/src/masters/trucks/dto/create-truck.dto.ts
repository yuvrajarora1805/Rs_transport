import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateTruckDto {
  @IsString()
  @IsNotEmpty()
  truckNo: string;

  @IsString()
  @IsOptional()
  ownerName?: string;

  @IsString()
  @IsOptional()
  mobileNo?: string;

  @IsString()
  @IsOptional()
  truckType?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  transporterId?: string;
}

