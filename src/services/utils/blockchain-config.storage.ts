import { BadRequestException, Injectable } from '@nestjs/common';

import { BlockChainConfig } from './blockchain.config';

import { ErrorMessages } from '../../infrastructure/config/const/error-messages.const';

import { BlockchainTypeEnum } from '../../infrastructure/config/enums/blockchain-type.enum';

import { ApiConfigService } from '../../infrastructure/config/api-config.service';

@Injectable()
export class BlockchainConfigStorage {
  private readonly blockchainConfigs: BlockChainConfig[] = [];

  constructor(
    private readonly configService: ApiConfigService,
  ) {}

  public addConfig(type: BlockchainTypeEnum): void {
    const existingProvider = this.blockchainConfigs.find((x) => x.blockchainType === type);

    if (existingProvider != null) {
      throw new BadRequestException(ErrorMessages.PROVIDER_ALREADY_EXISTS);
    }

    let provider = '';

    switch (type) {
      case BlockchainTypeEnum.ETHEREUM:
        provider = this.configService.ethWebSocketProvider;
        break;

      case BlockchainTypeEnum.POLYGON_MAINNET:
        provider = this.configService.polygonWebSocketProvider;
        break;

      default:
        throw new BadRequestException(ErrorMessages.INVALID_PROVIDER);
    }

    const config = new BlockChainConfig(provider, type);
    this.blockchainConfigs.push(config);
  }

  public getConfig(type: BlockchainTypeEnum): BlockChainConfig {
    const existingProvider = this.blockchainConfigs.find((x) => x.blockchainType === type);

    if (existingProvider == null) {
      throw new BadRequestException(ErrorMessages.PROVIDER_NOT_EXISTS);
    }

    return existingProvider;
  }
}
