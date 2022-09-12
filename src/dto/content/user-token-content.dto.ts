export class UserTokenContentDto {
  tokenId: string;

  tokenType: string;

  blockNumber: number;

  transactionHash: string;

  fromAddress: string;

  toAddress: string;

  smartContractAddress: string;

  metadataUri?: string;
}
