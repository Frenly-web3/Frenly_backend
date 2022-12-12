import { BadRequestException } from '@nestjs/common';
import { EntityRepository } from '@mikro-orm/postgresql';
import { CommunityEntity } from '../data/entity/community.entity';

export class CommunityRepository extends EntityRepository<CommunityEntity> {
  public async getAll(take?: number, skip?: number): Promise<CommunityEntity[]> {
    try {
      return await this.findAll({
        limit: take,
        offset: skip,
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  public async getOneById(id: number): Promise<CommunityEntity> {
    try {
      return await this.findOne({ id }, { populate: ['members'] });
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  public async getOneByContractAddress(contractAddress: string): Promise<CommunityEntity> {
    try {
      return await this.findOne({ contractAddress });
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  public async createCommunity(entity: CommunityEntity): Promise<CommunityEntity> {
    try {
      await this.persistAndFlush(entity);
      return entity;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Something');
    }
  }
}
