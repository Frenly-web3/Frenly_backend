import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserService } from '../services/user.service';

import { WalletAddressDto } from '../dto/user/wallet-address.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Post('/subscribe/:walletAddress')
  @UseGuards(AuthGuard())
  public async createSubscription(@Param() param: WalletAddressDto): Promise<number> {
    const { walletAddress } = param;

    return this.userService.createSubscription(walletAddress);
  }
}
