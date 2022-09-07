import { BaseNFTContract } from './base-nft-contract';

export class BaseNFTContractFactory {
  constructor(private readonly ETH_PROVIDER: string) {}

  public createBaseContract(address: string): BaseNFTContract {
    return new BaseNFTContract(this.ETH_PROVIDER, address);
  }
}
