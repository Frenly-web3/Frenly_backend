import { BlockchainTypeEnum } from '../../infrastructure/config/enums/blockchain-type.enum';

export class NftPostLookupDto {
  id: number;

  fromAddress: string;

  toAddress: string;

  tokenId: string;

  blockchainType: BlockchainTypeEnum;

  contractAddress: string;

  tokenUri: string;

  image: string;

  transactionHash: string;

  lensId: string;

  isMirror: boolean;

  mirrorDescription: string;

  creationDate: Date;

  transferType: string;
}
