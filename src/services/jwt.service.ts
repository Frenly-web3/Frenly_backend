import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as uuid from 'uuid';
import moment from 'moment';

import { ApiConfigService } from '../infrastructure/config/api-config.service';

// import { RefreshTokenRepository } from '../repository/refresh-token.repository';

import { RefreshTokenEntity } from '../data/entity/refresh-token.entity';

import { JwtPair } from '../dto/jwt/jwt-pair.dto';
import { JwtPayload } from '../dto/jwt/jwt-payload';

@Injectable()
export class ApiJWTService {
  constructor(
    private readonly configService: ApiConfigService,

    private readonly jwtService: JwtService,

    // private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  // public async generateTokensPair(userId: number, payload: JwtPayload): Promise<JwtPair> {
  //   const refreshTokenId = uuid.v4();
  //   const jti = uuid.v4();

  //   const refreshTokenExpirationDate = moment().add(this.configService.refreshTokenExpirationTime, 'ms').toDate();

  //   const accessToken = await this.jwtService.signAsync({ ...payload, jti });
  //   const refreshToken = await this.refreshTokenRepository.create(userId, {
  //     tokenId: refreshTokenId,
  //     jwtId: jti,
  //     expiryDate: refreshTokenExpirationDate,
  //   });

  //   return { accessToken, refreshToken: refreshToken.tokenId };
  // }

  // public async getStoredRefreshToken(jwtId: string, refreshToken: string): Promise<RefreshTokenEntity> {
  //   const storedRefreshToken = await this.refreshTokenRepository.getOneById(refreshToken);

  //   if (storedRefreshToken == null
  //     || moment(storedRefreshToken.expiryDate).isBefore(Date.now())
  //     || storedRefreshToken.isInvalidated
  //     || storedRefreshToken.isUsed
  //     || storedRefreshToken.jwtId !== jwtId
  //   ) {
  //     return null;
  //   }

  //   return storedRefreshToken;
  // }
}
