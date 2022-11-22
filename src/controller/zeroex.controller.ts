/* eslint-disable prefer-destructuring */
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ZeroExService } from '../services/zeroex.service';

import { SellOrderDto } from '../dto/zeroex/sell-order.dto';

@Controller('zeroex')
export class ZeroExController {
  constructor(
    private readonly zeroExService: ZeroExService,
  ) {}

  @Post('sell')
  @UseGuards(AuthGuard())
  async func(@Body() dto: SellOrderDto): Promise<number> {
    return this.zeroExService.publishSellRequest({ ...dto });
  }
}
