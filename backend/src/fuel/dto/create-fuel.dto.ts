import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateFuelDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  truckId: string;

  @IsString()
  @IsOptional()
  tripId?: string;

  @IsString()
  @IsOptional()
  dispatchId?: string;

  @IsString()
  @IsNotEmpty()
  pumpId: string;

  @IsNumber()
  @IsOptional()
  litres?: number;

  @IsNumber()
  @IsOptional()
  rate?: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  slipImage?: string;
}

