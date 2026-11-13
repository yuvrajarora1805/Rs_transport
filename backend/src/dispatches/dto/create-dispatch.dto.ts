import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateDispatchDto {
  @IsString()
  @IsOptional()
  srNo?: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  truckId: string;

  @IsString()
  @IsNotEmpty()
  sourceId: string;

  @IsNumber()
  @IsOptional()
  bales?: number;

  @IsString()
  @IsOptional()
  destination?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsOptional()
  driverMobile?: string;

  @IsString()
  @IsOptional()
  companyCode?: string;

  @IsNumber()
  @IsOptional()
  tareWeight?: number;

  @IsNumber()
  @IsOptional()
  grossWeight?: number;

  @IsNumber()
  @IsOptional()
  netWeight?: number;

  @IsString()
  @IsOptional()
  material?: string;

  @IsString()
  @IsOptional()
  slipImage?: string;
}

