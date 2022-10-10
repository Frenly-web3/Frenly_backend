import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { BlockchainTypeEnum } from '../infrastructure/config/enums/blockchain-type.enum';

import { BlockSubscriberService } from './block-subscriber.service';

@Injectable()
export class CronService {
  constructor(
    private readonly blockSubscriberService: BlockSubscriberService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async fetchMissedBlocks() {
    const { isSubscribed } = await this.blockSubscriberService.status();

    if (!isSubscribed) {
      return;
    }

    try {
      await this.blockSubscriberService.fetchMissedBlocks(BlockchainTypeEnum.ETHEREUM);
    } catch (e) {
      if (e instanceof Error && e.message === 'CONNECTION ERROR: Provider started to reconnect before the response got received!') {
        await this.fetchMissedBlocks();
      }
    }
  }
}
