import { BlockchainTypeEnum } from '../../infrastructure/config/enums/blockchain-type.enum';

export class FeedContentDto {
  fromAddress: string;

  toAddress: string;

  tokenId: string;

  blockchainType: BlockchainTypeEnum;

  contractAddress: string;

  tokenUri: string;

  image: string;

  transactionHash: string;

  lensId: string;

  creationDate: Date;
}
