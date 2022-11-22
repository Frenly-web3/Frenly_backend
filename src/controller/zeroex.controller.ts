/* eslint-disable prefer-destructuring */
import { Body, Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ImageFilesInterceptor } from '../infrastructure/middlewares/interceptors/image-files.interceptor';

import { ZeroExService } from '../services/zeroex.service';

import { SellOrderDto } from '../dto/zeroex/sell-order.dto';
import { ImageFileFolder } from '../infrastructure/config/enums/image-file-folder.enum';

@Controller('zeroex')
export class ZeroExController {
  constructor(
    private readonly zeroExService: ZeroExService,
  ) {}

  @Post('sell')
  @UseGuards(AuthGuard())
  @UseInterceptors(ImageFilesInterceptor([{ name: 'image', maxCount: 1 }], ImageFileFolder.ZEROEX_SELL))
  async func(@Body() dto: SellOrderDto, @UploadedFiles() files: { image?: Express.Multer.File }): Promise<number> {
    let image: Express.Multer.File;

    if (files?.image != null) {
      image = files.image[0];
    }

    return this.zeroExService.publishSellRequest({ ...dto, image });
  }
}
