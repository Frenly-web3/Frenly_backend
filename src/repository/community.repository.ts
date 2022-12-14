import { BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CommunityDto } from '../dto/community/community.dto';
import { CommunityEntity } from '../data/entity/community.entity';

export class CommunityRepository {
  private readonly repository: Repository<CommunityEntity>;

  constructor(
    @InjectDataSource()
    private readonly connection: DataSource,
  ) {
    this.repository = connection.getRepository(CommunityEntity);
  }

  public async getAll(take?: number, skip?: number): Promise<CommunityEntity[]> {
    try {
      return await this.repository.find({
        take,
        skip,
        relations: ['creator', 'members']
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  public async getOneById(id: number): Promise<CommunityEntity> {
    try {
      return await this.repository.findOne({ where: { id }, relations: ['members', 'creator'] });
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  public async getOneByContractAddress(contractAddress: string): Promise<CommunityEntity> {
    try {
      return await this.repository.findOne({ where: { contractAddress } });
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  // public async create(data: CommunityDto): Promise<CommunityEntity> {
  //   const community = this.repository.create(data);
  //   await this.repository.save(community);
  //   return community;
  // }

   public async create(communityData: CommunityEntity): Promise<CommunityEntity> {
    const community = this.repository.create(communityData);
    await this.repository.save(community);
    return community;
  }

  public async save(entity: CommunityEntity): Promise<CommunityEntity> {
    try {
      return await this.repository.save(entity);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Something');
    }
  }
}
