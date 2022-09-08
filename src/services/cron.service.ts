import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

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

    await this.blockSubscriberService.fetchMissedBlocks();
  }
}
