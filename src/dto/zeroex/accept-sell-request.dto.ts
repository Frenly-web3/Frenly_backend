import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class AcceptSellRequestDto {
  @IsNumber()
  @Type(() => Number)
    id: number;
}
