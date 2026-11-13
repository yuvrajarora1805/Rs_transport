import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  settlementId: string;

  @IsDateString()
  @IsNotEmpty()
  paymentDate: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  method?: string;

  @IsString()
  @IsOptional()
  refNo?: string;

  @IsString()
  @IsOptional()
  paidTo?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}
