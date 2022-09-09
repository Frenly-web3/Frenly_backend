import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { UserRepository } from './user.repository';

import { RefreshTokenEntity } from '../data/entity/refresh-token.entity';

import { RefreshTokenDto } from '../dto/jwt/refresh-token.dto';

@Injectable()
export class RefreshTokenRepository {
  private readonly repository: Repository<RefreshTokenEntity>;

  constructor(
    @InjectDataSource()
    private readonly connection: DataSource,

    private readonly userRepository: UserRepository,
  ) {
    this.repository = connection.getRepository(RefreshTokenEntity);
  }

  public async getOneById(tokenId: string): Promise<RefreshTokenEntity> {
    return this.repository.findOne({ where: { tokenId } });
  }

  public async create(userId: number, data: RefreshTokenDto): Promise<RefreshTokenEntity> {
    const user = await this.userRepository.getOneById(userId);

    const refreshToken = this.repository.create({
      ...data,
      user,
    });
    await this.repository.save(refreshToken);

    return refreshToken;
  }

  public async save(refreshToken: RefreshTokenEntity): Promise<RefreshTokenEntity> {
    return this.repository.save(refreshToken);
  }
}
