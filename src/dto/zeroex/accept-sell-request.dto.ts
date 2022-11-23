import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class AcceptSellRequestDto {
  @IsNumber()
  @Type(() => Number)
    id: number;

  @IsString()
    walletAddress: string;
}
