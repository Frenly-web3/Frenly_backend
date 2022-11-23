/* eslint-disable prefer-destructuring */
import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ZeroExService } from '../services/zeroex.service';

import { SellOrderDto } from '../dto/zeroex/sell-order.dto';
import { AcceptSellRequestDto } from '../dto/zeroex/accept-sell-request.dto';
import { DeclineSellRequestDto } from '../dto/zeroex/decline-sell-request.dto';

@Controller('zeroex')
export class ZeroExController {
  constructor(
    private readonly zeroExService: ZeroExService,
  ) {}

  @Post('sell')
  @UseGuards(AuthGuard())
  async publishSellRequest(@Body() dto: SellOrderDto): Promise<number> {
    return this.zeroExService.publishSellRequest({ ...dto });
  }

  @Post('accept/:id/:walletAddress')
  @UseGuards(AuthGuard())
  async acceptSellRequest(@Param() { id, walletAddress }: AcceptSellRequestDto): Promise<void> {
    return this.zeroExService.acceptSellRequest(id, walletAddress);
  }

  @Delete('decline/:id')
  @UseGuards(AuthGuard())
  async declineSellRequest(@Param() { id }: DeclineSellRequestDto): Promise<void> {
    return this.zeroExService.declineSellRequest(id);
  }
}
