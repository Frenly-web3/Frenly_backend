import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { BlockchainTypeEnum } from '../infrastructure/config/enums/blockchain-type.enum';

import { BlockSubscriberService } from './block-subscriber.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger();

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

  @Cron(CronExpression.EVERY_4_HOURS)
  async restartSubscription() {
    const { isSubscribed } = await this.blockSubscriberService.status();

    if (!isSubscribed) {
      return;
    }

    await this.blockSubscriberService.unsubscribe(null);

    this.logger.log('Start planned subscription restart');
    await this.sleep(30000);
    this.logger.log('Start planned subscription restart');

    await this.blockSubscriberService.subscribe();
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
