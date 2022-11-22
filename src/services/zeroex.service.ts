import { BadRequestException, Injectable } from '@nestjs/common';
import fs from 'fs';

import { CurrentUserService } from './current-user.service';

import { PostRepository } from '../repository/post.repository';
import { UserRepository } from '../repository/user.repository';

import { PostTypeEnum } from '../infrastructure/config/enums/post-type.enum';

import { SellOrderDto } from '../dto/zeroex/sell-order.dto';

@Injectable()
export class ZeroExService {
  constructor(
    private readonly currentUserService: CurrentUserService,

    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async publishSellRequest(dto: SellOrderDto): Promise<number> {
    try {
      const { walletAddress } = this.currentUserService.getCurrentUserInfo();
      const { id } = await this.userRepository.getOneByWalletAddress(walletAddress.toLowerCase());

      const post = await this.postRepository.createZeroExPost(id, {
        ...dto,
        image: dto?.image?.filename,
        type: PostTypeEnum.SELL_ORDER,
      });

      return post.id;
    } catch (e) {
      if (fs.existsSync(dto.image?.path)) {
        fs.unlinkSync(dto.image?.path);
      }

      throw new BadRequestException(e);
    }
  }
}
