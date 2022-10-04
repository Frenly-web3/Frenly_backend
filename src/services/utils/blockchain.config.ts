import Web3 from 'web3';

import { BlockchainTypeEnum } from '../../infrastructure/config/enums/blockchain-type.enum';
import { BaseNFTContractFactory } from './base-nft-contract.factory';

export class BlockChainConfig {
  readonly NFTContractFactory: BaseNFTContractFactory;

  readonly web3: Web3;

  constructor(
    private readonly provider: string,
    readonly blockchainType: BlockchainTypeEnum,
  ) {
    const wsOptions = {
      clientConfig: {
        maxReceivedFrameSize: 100000000,
        maxReceivedMessageSize: 100000000,
      },
    };

    this.web3 = new Web3(new Web3.providers.WebsocketProvider(provider, wsOptions));
    this.NFTContractFactory = new BaseNFTContractFactory(provider);
  }
}
