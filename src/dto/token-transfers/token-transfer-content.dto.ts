import { ERCTokenEnum } from '../../infrastructure/config/enums/erc-tokens.enum';

export class TokenTransferContentDto {
  transactionHash: string;

  fromAddress: string;

  toAddress: string;

  smartContractAddress: string;

  tokenId: string;

  tokenType: ERCTokenEnum;

  metadataUri: string;

  blockNumber: number;
}
