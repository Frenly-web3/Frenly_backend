import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class DeclineSellRequestDto {
  @IsNumber()
  @Type(() => Number)
    id: number;
}
