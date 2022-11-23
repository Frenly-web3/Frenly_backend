import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { CurrentUserService } from './current-user.service';

import { PostRepository } from '../repository/post.repository';
import { UserRepository } from '../repository/user.repository';

import { PostTypeEnum } from '../infrastructure/config/enums/post-type.enum';

import { ErrorMessages } from '../infrastructure/config/const/error-messages.const';

import { SellOrderDto } from '../dto/zeroex/sell-order.dto';
import { PostStatusEnum } from '../infrastructure/config/enums/post-status.enum';

@Injectable()
export class ZeroExService {
  constructor(
    private readonly currentUserService: CurrentUserService,

    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async publishSellRequest(dto: SellOrderDto): Promise<number> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const { id } = await this.userRepository.getOneByWalletAddress(walletAddress.toLowerCase());

    const post = await this.postRepository.createZeroExPost(id, {
      ...dto,
      type: PostTypeEnum.SELL_ORDER,
    });

    return post.id;
  }

  async acceptSellRequest(id: number): Promise<void> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const buyer = await this.userRepository.getOneByWalletAddress(walletAddress.toLowerCase());

    const post = await this.postRepository.getPostById(id);

    if (post == null || post.type !== PostTypeEnum.SELL_ORDER || post.status !== PostStatusEnum.PUBLISHED) {
      throw new NotFoundException(ErrorMessages.CONTENT_NOT_FOUND);
    }

    post.status = PostStatusEnum.UNPUBLISHED;
    await this.postRepository.save(post);

    const seller = await this.userRepository.getOneByWalletAddress(post.owner.walletAddress.toLowerCase());

    await this.postRepository.createZeroExPost(seller.id, {
      image: post.zeroExPost.image,
      walletAddress: seller.walletAddress,
      price: post.zeroExPost.price,
      collectionName: post.zeroExPost.collectionName,
      signedObject: '',
      type: PostTypeEnum.SELL_EVENT,
    });

    await this.postRepository.createZeroExPost(buyer.id, {
      image: post.zeroExPost.image,
      walletAddress: buyer.walletAddress,
      price: post.zeroExPost.price,
      collectionName: post.zeroExPost.collectionName,
      signedObject: '',
      type: PostTypeEnum.BUY_EVENT,
    });
  }

  async declineSellRequest(id: number): Promise<void> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const seller = await this.userRepository.getOneByWalletAddress(walletAddress.toLowerCase());

    const post = await this.postRepository.getPostById(id);

    if (post == null || post.type !== PostTypeEnum.SELL_ORDER || post.status !== PostStatusEnum.PUBLISHED) {
      throw new NotFoundException(ErrorMessages.CONTENT_NOT_FOUND);
    }

    if (post.owner.walletAddress !== seller.walletAddress) {
      throw new ForbiddenException(ErrorMessages.CONTENT_NOT_OWNED);
    }

    post.status = PostStatusEnum.UNPUBLISHED;
    await this.postRepository.save(post);
  }
}
