import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';

import { UserRepository } from './user.repository';
import { NftTokenPostRepository } from './nft-token-post.repository';
import { SubscriptionRepository } from './subscription.repository';

import { PostEntity } from '../data/entity/post.entity';

import { PostStatusEnum } from '../infrastructure/config/enums/post-status.enum';

import { NftPostDto } from '../dto/nft-posts/nft-post.dto';

@Injectable()
export class PostRepository {
  private readonly repository: Repository<PostEntity>;

  constructor(
    @InjectDataSource()
    private readonly connection: DataSource,

    private readonly userRepository: UserRepository,
    private readonly subscriptionRepository: SubscriptionRepository,

    private readonly nftTokenPostRepository: NftTokenPostRepository,
  ) {
    this.repository = connection.getRepository(PostEntity);
  }

  // Feed

  public async getTotalFeedByUserId(id: number, take?: number, skip?: number): Promise<PostEntity[]> {
    return this.repository.find({
      where: {
        owner: { id: Not(id) },
        status: PostStatusEnum.PUBLISHED,
      },

      order: {
        createdAt: 'DESC',
      },

      take,
      skip,

      relations: ['owner', 'nftPost', 'nftPost.metadata'],
    });
  }

  public async getOwnedFeedByUserId(id: number, take?: number, skip?: number): Promise<PostEntity[]> {
    return this.repository.find({
      where: {
        owner: { id },
        status: PostStatusEnum.PUBLISHED,
      },

      order: {
        createdAt: 'DESC',
      },

      take,
      skip,

      relations: ['owner', 'nftPost', 'nftPost.metadata'],
    });
  }

  public async getRespondentsFeedByUserId(id: number, take?: number, skip?: number): Promise<PostEntity[]> {
    const respondents = await this.subscriptionRepository.getUserRespondentsById(id);
    const respondentsIds = respondents.map((e) => e.id);

    return this.repository.find({
      where: {
        owner: { id: In(respondentsIds) },
        status: PostStatusEnum.PUBLISHED,
      },

      order: {
        createdAt: 'DESC',
      },

      take,
      skip,

      relations: ['owner', 'nftPost', 'nftPost.metadata'],
    });
  }

  // Drafts

  public async getDraftById(id: number): Promise<PostEntity> {
    return this.repository.findOne({
      where: {
        id,
        status: PostStatusEnum.PENDING,
      },

      relations: ['owner'],
    });
  }

  public async getDraftsByUserId(id: number, take?: number, skip?: number): Promise<PostEntity[]> {
    return this.repository.find({
      where: {
        owner: { id },
        status: PostStatusEnum.PENDING,
      },

      order: {
        createdAt: 'DESC',
      },

      take,
      skip,

      relations: ['owner', 'nftPost', 'nftPost.metadata'],
    });
  }

  public async createNftTokenPost(
    userId: number,
    data: NftPostDto,
    status = PostStatusEnum.PENDING,
    createdAt = new Date(),
    updatedAt = new Date(),
  ): Promise<PostEntity> {
    const owner = await this.userRepository.getOneById(userId);
    const nftPost = await this.nftTokenPostRepository.create(data);

    const entity = this.repository.create({
      status,

      createdAt,
      updatedAt,

      owner,
      nftPost,
    });

    return this.repository.save(entity);
  }

  public async save(entity: PostEntity): Promise<PostEntity> {
    return this.repository.save(entity);
  }
}
