import { Controller, Get, Post } from '@nestjs/common';

import { BlockSubscriberService } from '../services/block-subscriber.service';

import { SubscriptionServiceStatus } from '../dto/subscription-service/subscription-service-status.dto';

@Controller('subscription')
export class BlockSubscriberController {
  constructor(
    private readonly blockSubscriberService: BlockSubscriberService,
  ) {}

  @Get('status')
  public async status(): Promise<SubscriptionServiceStatus> {
    return this.blockSubscriberService.status();
  }

  @Post('subscribe')
  public async subscribe(): Promise<void> {
    return this.blockSubscriberService.subscribe();
  }

  @Post('unsubscribe')
  public async unsubscribe(): Promise<void> {
    return this.blockSubscriberService.unsubscribe(null);
  }
}
