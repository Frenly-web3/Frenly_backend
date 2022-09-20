import { BlockchainTypeEnum } from '../../infrastructure/config/enums/blockchain-type.enum';

export class UserTokenContentDto {
  transferType: string;

  fromAddress: string;

  toAddress: string;

  tokenId: string;

  blockchainType: BlockchainTypeEnum;

  contractAddress: string;

  tokenUri: string;

  transactionHash: string;
}
