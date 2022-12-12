import { UserEntity } from 'src/data/entity/user.entity';
import { Injectable, BadRequestException } from '@nestjs/common';
import { EntityRepository } from '@mikro-orm/postgresql';
import { LoadStrategy, PopulateHint } from '@mikro-orm/core';
import { CommunityEntity } from '../data/entity/community.entity';

import { UserRepository } from './user.repository';
import { NftTokenPostRepository } from './nft-token-post.repository';

import { PostEntity } from '../data/entity/post.entity';

import { PostStatusEnum } from '../infrastructure/config/enums/post-status.enum';
import { UserRole } from '../infrastructure/config/enums/users-role.enum';

import { NftPostDto } from '../dto/nft-posts/nft-post.dto';

@Injectable()
export class PostRepository extends EntityRepository<PostEntity> {
  // Feed

  public async getByLensId(id: string): Promise<PostEntity> {
    return this.findOne(
      {
        nftPost: { lensId: id },
      },

      {
        orderBy: {
          createdAt: 'DESC',
        },

        populate: ['owner', 'nftPost', 'nftPost.metadata'],
      },
    );
  }

  public async getPostById(id: number): Promise<PostEntity> {
    return this.findOne(
      {
        id,
      },
      {
        orderBy: {
          createdAt: 'DESC',
        },

        populate: ['owner', 'nftPost', 'nftPost.metadata'],
      },
    );
  }

  public async getTotalFeedByUserId(
    take?: number,
    skip?: number,
  ): Promise<PostEntity[]> {
    return this.find(
      {
        status: PostStatusEnum.PUBLISHED,
      },
      {

        orderBy: {
          createdAt: 'DESC',
        },

        limit: take,
        offset: skip,

        populate: ['owner', 'nftPost', 'nftPost.metadata'],
      },
    );
  }

  public async getTotalFeedWithExclusion(
    excludedIds: number[],
    take?: number,
    skip?: number,
  ): Promise<PostEntity[]> {
    return this.find(
      {
        status: PostStatusEnum.PUBLISHED,
        id: { $nin: excludedIds },
      },
      {

        orderBy: {
          createdAt: 'DESC',
        },

        limit: take,
        offset: skip,

        populate: ['owner', 'nftPost', 'nftPost.metadata'],
      },
    );
  }

  public async getOwnedFeedByUserId(
    id: number,
    take?: number,
    skip?: number,
  ): Promise<PostEntity[]> {
    return this.find(
      {
        owner: { id },
        status: PostStatusEnum.PUBLISHED,
      },
      {
        orderBy: {
          createdAt: 'DESC',
        },

        limit: take,
        offset: skip,

        populate: ['owner', 'nftPost', 'nftPost.metadata'],
      },
    );
  }

  public async getOwnedFeedByUserIds(
    ids: number[],
    take?: number,
    skip?: number,
  ): Promise<PostEntity[]> {
    return this.find(
      {
        owner: { id: ids },
        status: PostStatusEnum.PUBLISHED,
      },

      {
        orderBy: {
          createdAt: 'DESC',
        },

        limit: take,
        offset: skip,

        populate: ['owner', 'nftPost', 'nftPost.metadata'],
      },
    );
  }

  public async getCommunityFeed(
    community: CommunityEntity,
    communityMemberIds: number[],
    take?: number,
    skip?: number,

  ): Promise<PostEntity[]> {
    try {
      return await this.find(
        {
          // owner: { id: communityMemberIds, communitiesMember: { $eq: community.id } },
          owner: { id: communityMemberIds },

          status: PostStatusEnum.PUBLISHED,
        // nftPost: { scAddress: community.contractAddress.toLowerCase() },
        },
        {

          orderBy: {
            createdAt: 'DESC',
          },

          limit: take,
          offset: skip,

          populate: ['owner', 'nftPost', 'nftPost.metadata'],
        },
      );
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  // Drafts

  public async getDraftById(id: number): Promise<PostEntity> {
    return this.findOne(
      {
        id,
        status: PostStatusEnum.PENDING,
      },

      {
        populate: ['owner', 'nftPost', 'nftPost.metadata'],
      },
    );
  }

  public async getDraftsByUserId(
    id: number,
    take?: number,
    skip?: number,
  ): Promise<PostEntity[]> {
    return this.find(
      {
        owner: { id },
        status: PostStatusEnum.PENDING,
      },

      {

        orderBy: {
          createdAt: 'DESC',
        },

        limit: take,
        offset: skip,

        populate: ['owner', 'nftPost', 'nftPost.metadata'],
      },
    );
  }

  // ADMIN

  public async getAdminsPost(
    take?: number,
    skip?: number,
  ): Promise<PostEntity[]> {
    return this.find(
      {
        owner: { role: { $eq: UserRole.ADDED_BY_ADMIN } },
        // owner: {
        // role: UserRole.ADDED_BY_ADMIN,
        // },
        status: PostStatusEnum.PENDING,
      },
      {
        strategy: LoadStrategy.JOINED,
        orderBy: {
          createdAt: 'DESC',
        },

        limit: take,
        offset: skip,

        populateWhere: PopulateHint.ALL,

        populate: ['owner.role', 'nftPost', 'nftPost.metadata'],
      },
    );
  }

  public async getAdminsPublishedPost(
    notIncludedIds?: number[],
    take?: number,
    skip?: number,
  ): Promise<PostEntity[]> {
    return this.find(
      {
        owner: {
          role: { $eq: UserRole.ADDED_BY_ADMIN },
        },
        status: PostStatusEnum.PUBLISHED,
        id: { $nin: notIncludedIds },
      },

      {
        orderBy: {
          createdAt: 'DESC',
        },

        limit: take,
        offset: skip,

        populate: ['owner', 'nftPost', 'nftPost.metadata'],
      },
    );
  }

  public async createNftTokenPost(post: PostEntity): Promise<PostEntity> {
    try {
      await this.persistAndFlush(post);

      return post;
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }
}
