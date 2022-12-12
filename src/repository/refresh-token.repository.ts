import { Injectable, BadRequestException } from '@nestjs/common';

import { EntityRepository } from '@mikro-orm/postgresql';
import { UserEntity } from '../data/entity/user.entity';

import { RefreshTokenEntity } from '../data/entity/refresh-token.entity';

import { RefreshTokenDto } from '../dto/jwt/refresh-token.dto';

@Injectable()
export class RefreshTokenRepository extends EntityRepository<RefreshTokenEntity> {
  public async getOneById(tokenId: string): Promise<RefreshTokenEntity> {
    try {
      return await this.findOne({ tokenId });
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  public async createRefreshToken(user: UserEntity, data: RefreshTokenDto): Promise<RefreshTokenEntity> {
    try {
      const refreshToken = await this.create({ ...data,
        user });
      await this.persistAndFlush(refreshToken);

      return refreshToken;
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  // public async save(refreshToken: RefreshTokenEntity): Promise<RefreshTokenEntity> {
  //   return this.save(refreshToken);
  // }
}
