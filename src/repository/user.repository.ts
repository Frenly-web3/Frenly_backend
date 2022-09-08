import { InjectDataSource } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';

import { UserEntity } from '../data/entity/user.entity';

export class UserRepository {
  private readonly repository: Repository<UserEntity>;

  constructor(
    @InjectDataSource()
    private readonly connection: Connection,
  ) {
    this.repository = connection.getRepository(UserEntity);
  }

  public async getAll(): Promise<UserEntity[]> {
    return this.repository.find();
  }

  public async getOneById(userId: number): Promise<UserEntity> {
    return this.repository.findOne({ where: { id: userId } });
  }
}
