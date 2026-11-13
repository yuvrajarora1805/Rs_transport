import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateSettlementDto {
  @IsString()
  @IsNotEmpty()
  tripId: string;

  @IsNumber()
  @IsOptional()
  advanceAmount?: number;

  @IsNumber()
  @IsOptional()
  dieselAmount?: number;

  @IsNumber()
  @IsOptional()
  commission?: number;

  @IsNumber()
  @IsOptional()
  otherDeductions?: number;

  @IsString()
  @IsOptional()
  slipImage?: string;
}

