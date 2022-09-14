import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';

import { UserEntity } from '../data/entity/user.entity';

import { UserDto } from '../dto/user/user.dto';

export class UserRepository {
  private readonly repository: Repository<UserEntity>;

  constructor(
    @InjectDataSource()
    private readonly connection: DataSource,
  ) {
    this.repository = connection.getRepository(UserEntity);
  }

  public async getAll(searchString?: string, take?: number, skip?: number): Promise<UserEntity[]> {
    return this.repository.find({
      where: {
        walletAddress: Like(`%${searchString}%`),
      },

      take,
      skip,
    });
  }

  public async getOneById(userId: number): Promise<UserEntity> {
    return this.repository.findOne({ where: { id: userId } });
  }

  public async getOneByWalletAddress(walletAddress: string): Promise<UserEntity> {
    return this.repository.findOne({ where: { walletAddress } });
  }

  public async getTopContentOwners(amount: number = 10): Promise<[UserEntity, number]> {
    const content = await this.repository
      .createQueryBuilder('users')
      .leftJoin('users.contents', 'contents')
      .addSelect('COUNT(contents.id) as userContentsCount')
      .groupBy('users.id')
      .orderBy('userContentsCount', 'DESC')
      .limit(amount)
      .execute();

    return content.map((x) => {
      const user = new UserEntity();

      user.id = x.users_id;
      user.nonce = x.users_nonce;
      user.walletAddress = x.users_wallet_address;
      user.onCreationBlockNumber = x.users_on_creation_block_number;
      user.creationDate = x.users_creation_date;
      user.updateDate = x.users_update_date;

      return [user, Number(x.usercontentscount)];
    });
  }

  public async create(data: UserDto): Promise<UserEntity> {
    const user = this.repository.create(data);
    await this.repository.save(user);

    return user;
  }

  public async save(entity: UserEntity): Promise<UserEntity> {
    await this.repository.save(entity);

    return entity;
  }
}
