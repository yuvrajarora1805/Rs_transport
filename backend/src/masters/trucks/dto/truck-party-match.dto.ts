import { IsOptional, IsString } from 'class-validator';

export class TruckPartyMatchDto {
  @IsOptional()
  @IsString()
  truckNo?: string;

  @IsOptional()
  @IsString()
  partyName?: string;
}
