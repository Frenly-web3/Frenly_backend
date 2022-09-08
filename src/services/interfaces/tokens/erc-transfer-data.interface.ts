import { ERCTokenEnum } from '../../../infrastructure/config/enums/erc-tokens.enum';

export class IERCTransferData {
  transactionHash: string;

  logIndex: number;

  type: ERCTokenEnum;

  tokenId: number | string;

  tokensAmount: number | string;

  fromAddress: string;

  toAddress: string;

  contractAddress: string;

  tokenURI?: string;

  tokenName?: string;
}
