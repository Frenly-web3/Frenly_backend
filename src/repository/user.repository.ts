import { EntityRepository } from '@mikro-orm/postgresql';

import { UserEntity } from '../data/entity/user.entity';

import { UserDto } from '../dto/user/user.dto';

export class UserRepository extends EntityRepository<UserEntity> {
  public async getAll(searchString?: string, take?: number, skip?: number): Promise<UserEntity[]> {
    return this.find(
      {
        walletAddress: { $like: (`%${searchString ?? ''}%`) },
      },

      {
        limit: take,
        offset: skip,
      },
    );
  }

  public async getOneById(userId: number): Promise<UserEntity> {
    return this.findOne({ id: userId });
  }

  public async getOneByWalletAddress(walletAddress: string): Promise<UserEntity> {
    return this.findOne({ walletAddress });
  }

  // public async create(data: UserDto): Promise<UserEntity> {
  //   const user = await this.create(data);
  //   await this.save(user);

  //   return user;
  // }

  public async save(entity: UserEntity): Promise<UserEntity> {
    await this.save(entity);

    return entity;
  }
}
