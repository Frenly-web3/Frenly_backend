import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import * as httpContext from 'express-http-context';

import { ApiConfigService } from '../../config/api-config.service';

import { UserRepository } from '../../../repository/user.repository';

import { JwtPayload } from '../../../dto/jwt/jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ApiConfigService,

    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.accessTokenSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const { walletAddress } = payload;

    const user = await this.userRepository.getOneByWalletAddress(walletAddress);

    if (user == null) {
      throw new UnauthorizedException();
    }

    httpContext.set('token', payload);

    return payload;
  }
}
