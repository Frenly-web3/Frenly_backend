import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SellOrderDto {
  @IsOptional()
    image: Express.Multer.File;

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
