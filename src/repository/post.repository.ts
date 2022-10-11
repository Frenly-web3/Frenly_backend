import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { UserRepository } from './user.repository';
import { NftTokenPostRepository } from './nft-token-post.repository';

import { PostEntity } from '../data/entity/post.entity';

import { PostStatusEnum } from '../infrastructure/config/enums/post-status.enum';

import { NftPostDto } from '../dto/nft-posts/nft-post.dto';
import { UserRole } from '../infrastructure/config/enums/users-role.enum';

@Injectable()
export class PostRepository {
  private readonly repository: Repository<PostEntity>;

  constructor(
    @InjectDataSource()
    private readonly connection: DataSource,

    private readonly userRepository: UserRepository,

    private readonly nftTokenPostRepository: NftTokenPostRepository,
  ) {
    this.repository = connection.getRepository(PostEntity);
  }

  // Feed

  public async getByLensId(id: string): Promise<PostEntity> {
    return this.repository.findOne({
      where: {
        nftPost: { lensId: id },
      },

      order: {
        createdAt: 'DESC',
      },

      relations: ['owner', 'nftPost', 'nftPost.metadata'],
    });
  }

  public async getPostById(id: number): Promise<PostEntity> {
    return this.repository.findOne({
      where: {
        id,
      },

      order: {
        createdAt: 'DESC',
      },

      relations: ['owner', 'nftPost', 'nftPost.metadata'],
    });
  }

  public async getTotalFeedByUserId(take?: number, skip?: number): Promise<PostEntity[]> {
    return this.repository.find({
      where: {
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

  // Drafts

  public async getDraftById(id: number): Promise<PostEntity> {
    return this.repository.findOne({
      where: {
        id,
        status: PostStatusEnum.PENDING,
      },

      relations: ['owner', 'nftPost', 'nftPost.metadata'],
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

  // ADMIN

  public async getAdminsPost(take?: number, skip?: number): Promise<PostEntity[]> {
    return this.repository.find({
      where: {
        owner: {
          role: UserRole.ADDED_BY_ADMIN,
        },
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
