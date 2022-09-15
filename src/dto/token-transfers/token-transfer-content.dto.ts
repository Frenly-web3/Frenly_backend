import { BlockchainTypeEnum } from '../../infrastructure/config/enums/blockchain-type.enum';
import { ERCTokenEnum } from '../../infrastructure/config/enums/erc-tokens.enum';

export class TokenTransferContentDto {
  transactionHash: string;

  fromAddress: string;

  toAddress: string;

  smartContractAddress: string;

  tokenId: string;

  tokenType: ERCTokenEnum;

  blockchainType: BlockchainTypeEnum;

  metadataUri: string;

  blockNumber: number;
}
