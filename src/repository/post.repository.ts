import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { UserRepository } from './user.repository';
import { NftTokenPostRepository } from './nft-token-post.repository';

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

    private readonly nftTokenPostRepository: NftTokenPostRepository,
  ) {
    this.repository = connection.getRepository(PostEntity);
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
}
