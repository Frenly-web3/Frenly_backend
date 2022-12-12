import { BlockchainTypeEnum } from 'src/infrastructure/config/enums/blockchain-type.enum';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateCommunityDto {
  @IsString()
  @IsNotEmpty()
    name: string;

  @IsString()
  @IsNotEmpty()
    contractAddress: string;

  @IsNumber()
  @IsNotEmpty()
    network: BlockchainTypeEnum;
}
