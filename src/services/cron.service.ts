import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { BlockchainTypeEnum } from '../infrastructure/config/enums/blockchain-type.enum';

import { BlockSubscriberService } from './block-subscriber.service';

@Injectable()
export class CronService {
  constructor(
    private readonly blockSubscriberService: BlockSubscriberService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async fetchMissedBlocks() {
    const { isSubscribed } = await this.blockSubscriberService.status();

    if (!isSubscribed) {
      return;
    }

    await this.blockSubscriberService.fetchMissedBlocks(BlockchainTypeEnum.POLYGON_MAINNET);
    await this.blockSubscriberService.fetchMissedBlocks(BlockchainTypeEnum.ETHEREUM);
  }
}
