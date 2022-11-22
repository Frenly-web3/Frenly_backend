import { BlockchainTypeEnum } from '../../infrastructure/config/enums/blockchain-type.enum';
import { PostTypeEnum } from '../../infrastructure/config/enums/post-type.enum';

export class NftPostLookupDto {
  id: number;

  postType: PostTypeEnum;

  sellPrice: number;

  collectionName: string;

  signedObject: string;

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
