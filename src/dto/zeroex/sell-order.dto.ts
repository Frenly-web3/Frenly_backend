import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SellOrderDto {
  @IsOptional()
  @IsString()
    image: string;

  @IsString()
    walletAddress: string;

  @IsNumber()
  @Type(() => Number)
    price: number;

  @IsString()
    collectionName: string;

  @IsString()
    signedObject: string;
}
