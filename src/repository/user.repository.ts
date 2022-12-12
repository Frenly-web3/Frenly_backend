import { BadRequestException } from '@nestjs/common';
import { EntityRepository } from '@mikro-orm/postgresql';

import { UserEntity } from '../data/entity/user.entity';

import { UserDto } from '../dto/user/user.dto';

export class UserRepository extends EntityRepository<UserEntity> {
  public async getAll(searchString?: string, take?: number, skip?: number): Promise<UserEntity[]> {
    try {
      return await this.find(
        {
          walletAddress: { $like: (`%${searchString ?? ''}%`) },
        },

        {
          limit: take,
          offset: skip,
        },
      );
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  public async getOneById(userId: number): Promise<UserEntity> {
    try {
      return await this.findOne({ id: userId });
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  public async getOneByWalletAddress(walletAddress: string): Promise<UserEntity> {
    try {
      return await this.findOne({ walletAddress });
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  public async createUser(data: UserDto): Promise<UserEntity> {
    try {
      const user = await this.create(data);
      await this.persistAndFlush(user);

      return user;
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  // public async save(entity: UserEntity): Promise<UserEntity> {
  //   await this.save(entity);

  //   return entity;
  // }
}
