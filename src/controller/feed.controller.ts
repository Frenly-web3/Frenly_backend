import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { FeedService } from '../services/feed.service';

import { WalletAddressDto } from '../dto/user/wallet-address.dto';
import { PagingData } from '../dto/paging-data.dto';

@Controller('feed')
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
  ) {}

  @Get('/user/:walletAddress')
  public async getPostsByWalletAddress(@Param() { walletAddress }: WalletAddressDto, @Query() { take, skip }: PagingData) {
    return this.feedService.getPostsByWalletAddress(walletAddress, take, skip);
  }

  @Get('/total')
  @UseGuards(AuthGuard())
  public async getTotalFeed(@Query() { take, skip }: PagingData) {
    return this.feedService.getTotalFeed(take, skip);
  }

  @Get('/respondents')
  @UseGuards(AuthGuard())
  public async getRespondentsFeed(@Query() { take, skip }: PagingData) {
    return this.feedService.getRespondentsFeed(take, skip);
  }
}
