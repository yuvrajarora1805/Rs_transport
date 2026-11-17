import { IsOptional, IsString } from 'class-validator';

export class CompareDispatchesDto {
  @IsOptional()
  @IsString()
  partyName?: string;

  @IsOptional()
  @IsString()
  destination?: string;
}
