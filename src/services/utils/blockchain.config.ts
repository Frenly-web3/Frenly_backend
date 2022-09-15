import Web3 from 'web3';

import { BlockchainTypeEnum } from '../../infrastructure/config/enums/blockchain-type.enum';
import { BaseNFTContractFactory } from './base-nft-contract.factory';

export class BlockChainConfig {
  readonly NFTContractFactory: BaseNFTContractFactory;

  readonly web3: Web3;

  constructor(
    private readonly provider: string,
    private readonly smartContractProvider: string,
    readonly blockchainType: BlockchainTypeEnum,
  ) {
    this.web3 = new Web3(provider);

    this.NFTContractFactory = new BaseNFTContractFactory(smartContractProvider);
  }
}
