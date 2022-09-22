import { BlockchainTypeEnum } from '../../../infrastructure/config/enums/blockchain-type.enum';
import { ERCTokenEnum } from '../../../infrastructure/config/enums/erc-tokens.enum';

export interface IERCTransferData {
  transactionHash: string;

  logIndex: number;

  type: ERCTokenEnum;

  tokenId: number | string;

  tokensAmount: number | string;

  fromAddress: string;

  toAddress: string;

  contractAddress: string;

  blockchainType: BlockchainTypeEnum;

  tokenURI?: string;

  tokenName?: string;

  imageURI?: string;
}
