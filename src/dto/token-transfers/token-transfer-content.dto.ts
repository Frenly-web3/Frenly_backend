import { ERCTokenEnum } from '../../infrastructure/config/enums/erc-tokens.enum';

export class TokenTransferContentDto {
  transactionHash: string;

  fromAddress: string;

  toAddress: string;

  smartContractAddress: string;

  tokenHash: string;

  tokenType: ERCTokenEnum;

  blockNumber: number;
}
