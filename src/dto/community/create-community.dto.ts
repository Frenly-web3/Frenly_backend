import { BlockchainTypeEnum } from 'src/infrastructure/config/enums/blockchain-type.enum';
import { IsNotEmpty, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCommunityDto {
  @IsString()
  @IsNotEmpty()
    name: string;

  @IsString()
  @IsNotEmpty()
    contractAddress: string;

  @IsInt()
  @Min(0)
  @Max(1)
  @Transform(({ value }) => Number(value))
    network: BlockchainTypeEnum;

  @IsString()
  @IsNotEmpty()
    description: string;
}
