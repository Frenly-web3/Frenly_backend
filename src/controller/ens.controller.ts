import { Controller, Get, Param } from '@nestjs/common';

import { ENSService } from '../services/ens.service';

import { WalletAddressDto } from '../dto/user/wallet-address.dto';

@Controller('ens')
export class ENSController {
  constructor(
    private readonly ensService: ENSService,
  ) {}

  @Get('/:walletAddress')
  public async getUserInfo(@Param() { walletAddress }: WalletAddressDto): Promise<string> {
    return this.ensService.getENSByAddress(walletAddress);
  }
}
