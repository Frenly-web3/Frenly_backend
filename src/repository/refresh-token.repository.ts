// import { Injectable } from '@nestjs/common';

// import { UserRepository } from './user.repository';

// import { RefreshTokenEntity } from '../data/entity/refresh-token.entity';

// import { RefreshTokenDto } from '../dto/jwt/refresh-token.dto';
// import { EntityRepository } from '@mikro-orm/postgresql';

// @Injectable()
// export class RefreshTokenRepository extends EntityRepository<RefreshTokenEntity> {

//   public async getOneById(tokenId: string): Promise<RefreshTokenEntity> {
//     return this.findOne({ tokenId });
//   }

//   public async create(userId: string, data: RefreshTokenDto): Promise<RefreshTokenEntity> {
//     const user = await this.getOneById(userId);

//     const refreshToken = await this.create({
//       ...data,
//       user,
//     });
//     await this.save(refreshToken);

//     return refreshToken;
//   }

//   public async save(refreshToken: RefreshTokenEntity): Promise<RefreshTokenEntity> {
//     return this.save(refreshToken);
//   }
// }
