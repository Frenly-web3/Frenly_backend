import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';

import { CurrentUserService } from './current-user.service';

import { PostRepository } from '../repository/post.repository';
import { UserRepository } from '../repository/user.repository';

import { PostEntity } from '../data/entity/post.entity';

import { ErrorMessages } from '../infrastructure/config/const/error-messages.const';

import { PostStatusEnum } from '../infrastructure/config/enums/post-status.enum';

import { NftPostLookupDto } from '../dto/nft-posts/nft-post-lookup.dto';

@Injectable()
export class DraftsService {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,

    private readonly currentUserService: CurrentUserService,

    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async getDrafts(take: number, skip: number): Promise<NftPostLookupDto[]> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const { id } = await this.userRepository.getOneByWalletAddress(walletAddress.toLowerCase());

    const drafts = await this.postRepository.getDraftsByUserId(id, take, skip);
    return this.mapper.mapArray(drafts, PostEntity, NftPostLookupDto);
  }

  public async publishDraft(draftId: number): Promise<void> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const { id } = await this.userRepository.getOneByWalletAddress(walletAddress.toLowerCase());

    const draft = await this.postRepository.getDraftById(draftId);

    if (draft == null) {
      throw new NotFoundException(ErrorMessages.CONTENT_NOT_FOUND);
    }

    if (draft.owner.id !== id) {
      throw new NotFoundException(ErrorMessages.CONTENT_NOT_FOUND);
    }

    draft.status = PostStatusEnum.PUBLISHED;
    await this.postRepository.save(draft);
  }

  public async unpublishDraft(draftId: number): Promise<void> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const { id } = await this.userRepository.getOneByWalletAddress(walletAddress.toLowerCase());

    const draft = await this.postRepository.getDraftById(draftId);

    if (draft == null) {
      throw new NotFoundException(ErrorMessages.CONTENT_NOT_FOUND);
    }

    if (draft.owner.id !== id) {
      throw new NotFoundException(ErrorMessages.CONTENT_NOT_FOUND);
    }

    draft.status = PostStatusEnum.UNPUBLISHED;
    await this.postRepository.save(draft);
  }
}
