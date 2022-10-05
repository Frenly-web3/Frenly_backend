import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

import { CurrentUserService } from './current-user.service';

import { UserRepository } from '../repository/user.repository';
import { PostRepository } from '../repository/post.repository';

import { ErrorMessages } from '../infrastructure/config/const/error-messages.const';

import { PostEntity } from '../data/entity/post.entity';

import { NftPostLookupDto } from '../dto/nft-posts/nft-post-lookup.dto';

@Injectable()
export class FeedService {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,

    private readonly currentUserService: CurrentUserService,

    private readonly userRepository: UserRepository,
    private readonly postRepository: PostRepository,
  ) {}

  public async getPostsByWalletAddress(walletAddress: string, take: number, skip: number): Promise<NftPostLookupDto[]> {
    const user = await this.userRepository.getOneByWalletAddress(walletAddress.toLowerCase());

    if (user == null) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    const posts = await this.postRepository.getOwnedFeedByUserId(user.id, take, skip);
    return this.mapper.mapArray(posts, PostEntity, NftPostLookupDto);
  }

  public async getTotalFeed(take: number, skip: number): Promise<NftPostLookupDto[]> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const { id } = await this.userRepository.getOneByWalletAddress(walletAddress.toLowerCase());

    const posts = await this.postRepository.getTotalFeedByUserId(id, take, skip);
    return this.mapper.mapArray(posts, PostEntity, NftPostLookupDto);
  }

  public async getRespondentsFeed(take: number, skip: number): Promise<NftPostLookupDto[]> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const { id } = await this.userRepository.getOneByWalletAddress(walletAddress.toLowerCase());

    const posts = await this.postRepository.getRespondentsFeedByUserId(id, take, skip);
    return this.mapper.mapArray(posts, PostEntity, NftPostLookupDto);
  }
}
