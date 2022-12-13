import { BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PostEntity } from '../data/entity/post.entity';
import { CommentCreateDto } from '../dto/comments/create-comment.dto';
import { CommentEntity } from '../data/entity/comment.entity';
import { CommunityDto } from '../dto/community/community.dto';
import { CommunityEntity } from '../data/entity/community.entity';

export class CommentRepository {
  private readonly repository: Repository<CommentEntity>;

  constructor(
    @InjectDataSource()
    private readonly connection: DataSource,
  ) {
    this.repository = connection.getRepository(CommentEntity);
  }

  //   public async getAll(take?: number, skip?: number): Promise<CommunityEntity[]> {
  //     try {
  //       return await this.repository.find({
  //         take,
  //         skip,
  //       });
  //     } catch (error) {
  //       console.log(error);
  //       throw new BadRequestException();
  //     }
  //   }

  //   public async getOneById(id: number): Promise<CommunityEntity> {
  //     try {
  //       return await this.repository.findOne({ where: { id }, relations: ['members'] });
  //     } catch (error) {
  //       console.log(error);
  //       throw new BadRequestException();
  //     }
  //   }

  public async getCommentsByPostId(postId: number): Promise<CommentEntity[]> {
    try {
      // will it return only id without relation?
      return await this.repository.find({ where: { post: { id: postId } }, relations: ['creator'] });
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  //   public async getOneByContractAddress(contractAddress: string): Promise<CommunityEntity> {
  //     try {
  //       return await this.repository.findOne({ where: { contractAddress } });
  //     } catch (error) {
  //       console.log(error);
  //       throw new BadRequestException();
  //     }
  //   }

  public async create(data: CommentCreateDto): Promise<CommentEntity> {
    const comment = this.repository.create(data);
    await this.repository.save(comment);
    return comment;
  }

  public async save(entity: CommentEntity): Promise<CommentEntity> {
    try {
      return await this.repository.save(entity);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Something');
    }
  }
}
