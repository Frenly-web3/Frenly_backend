import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserService } from '../services/user.service';

import { WalletAddressDto } from '../dto/user/wallet-address.dto';
import { PagingData } from '../dto/paging-data.dto';
import { UserLookupDto } from '../dto/user/user-lookup.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Get()
  public async search(@Query() query: PagingData): Promise<UserLookupDto[]> {
    const { searchString, take, skip } = query;

    return this.userService.getAllUsers(searchString, take, skip);
  }

  @Post('/subscribe/:walletAddress')
  @UseGuards(AuthGuard())
  public async createSubscription(@Param() param: WalletAddressDto): Promise<number> {
    const { walletAddress } = param;

    return this.userService.createSubscription(walletAddress);
  }
}
