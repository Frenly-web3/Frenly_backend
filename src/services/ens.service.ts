import { Injectable } from '@nestjs/common';
import { ethers, providers } from 'ethers';

import { ApiConfigService } from '../infrastructure/config/api-config.service';

@Injectable()
export class ENSService {
  private readonly httpProvider: providers.WebSocketProvider;

  constructor(
    private readonly configService: ApiConfigService,
  ) {
    this.httpProvider = new ethers.providers.WebSocketProvider(configService.ethHttpProvider);
  }

  public async getENSByAddress(walletAddress: string): Promise<string> {
    return this.httpProvider.lookupAddress(walletAddress);
  }
}
