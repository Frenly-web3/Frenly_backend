import { BaseNFTContract } from './base-nft-contract';

export class BaseNFTContractFactory {
  constructor(private readonly provider: string) {}

  public createBaseContract(address: string): BaseNFTContract {
    return new BaseNFTContract(this.provider, address);
  }
}
