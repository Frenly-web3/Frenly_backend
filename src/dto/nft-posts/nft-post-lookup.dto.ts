import { BlockchainTypeEnum } from '../../infrastructure/config/enums/blockchain-type.enum';

export class NftPostLookupDto {
  transactionHash: string;

  tokenId: string;

  fromAddress: string;

  toAddress: string;

  blockchainType: BlockchainTypeEnum;

  contractAddress: string;

  metadataUri?: string;

  image?: string;

  isRepost: boolean;

  creationDate: Date;
}
