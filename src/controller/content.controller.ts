import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ContentService } from '../services/content.service';

import { UserContentDto } from '../dto/content/user-content.dto';
import { WalletAddressDto } from '../dto/user/wallet-address.dto';

@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
  ) {}

  @Get('')
  public async getUserContent(@Query() query: WalletAddressDto): Promise<UserContentDto[]> {
    const { walletAddress } = query;

    return this.contentService.getUserContent(walletAddress);
  }

  @Get('/subscriptions')
  @UseGuards(AuthGuard())
  public async getUserSubscriptionsContent(): Promise<UserContentDto[]> {
    return this.contentService.getUserSubscriptionsContent();
  }
}
