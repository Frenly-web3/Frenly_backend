import { Injectable } from '@nestjs/common';
import { NFTStorage, Blob } from 'nft.storage';

import { LensMetadata } from './interfaces/lens/lens-metadata.interface';

import { ApiConfigService } from '../infrastructure/config/api-config.service';

@Injectable()
export class IPFSService {
  private readonly client: NFTStorage;

  private readonly baseUrl = 'https://ipfs.io/ipfs';

  constructor(
    private readonly configService: ApiConfigService,
  ) {
    this.client = new NFTStorage({ token: configService.nftStorageApiKey });
  }

  public async upload(data: LensMetadata): Promise<string> {
    const buffer = Buffer.from(JSON.stringify(data));
    const blob = new Blob([buffer], { type: 'application/json' });

    const cid = await this.client.storeBlob(blob);

    return `${this.baseUrl}/${cid}`;
  }
}
