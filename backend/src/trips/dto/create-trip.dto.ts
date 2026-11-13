import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  tripNo: string;

  @IsString()
  @IsOptional()
  dispatchId?: string;

  @IsString()
  @IsNotEmpty()
  truckId: string;

  @IsString()
  @IsOptional()
  destinationId?: string;

  @IsString()
  @IsOptional()
  partyId?: string;

  @IsString()
  @IsOptional()
  transporterId?: string;

  @IsDateString()
  @IsOptional()
  unloadingDate?: string;

  @IsNumber()
  @IsOptional()
  grossWeight?: number;

  @IsNumber()
  @IsOptional()
  tareWeight?: number;

  @IsNumber()
  @IsNotEmpty()
  netWeight: number;

  @IsNumber()
  @IsNotEmpty()
  ratePerUnit: number;

  @IsString()
  @IsOptional()
  companyCode?: string;

  @IsString()
  @IsOptional()
  slipImage?: string;

  @IsString()
  @IsOptional()
  fuelPumpId?: string;

  @IsNumber()
  @IsOptional()
  fuelLitres?: number;

  @IsNumber()
  @IsOptional()
  fuelRate?: number;

  @IsNumber()
  @IsOptional()
  fuelAmount?: number;
}

