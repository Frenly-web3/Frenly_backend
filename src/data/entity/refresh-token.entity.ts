import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { RefreshTokenRepository } from '../../repository/refresh-token.repository';
import { UserEntity } from './user.entity';

// 
@Entity({ tableName: 'refresh_tokens', customRepository: () => RefreshTokenRepository })
export class RefreshTokenEntity {
  @PrimaryKey({ name: 'token_id', unique: true, autoincrement: false })
    tokenId: string;

  @Property({ name: 'jwt_id' })
    jwtId: string;

  @Property({ name: 'creation_date' })
    creationDate = new Date();

  @Property({ name: 'expiry_date' })
    expiryDate: Date;

  @Property({ name: 'is_used', default: false })
    isUsed: boolean;

  @Property({ name: 'is_invalidated', default: false })
    isInvalidated: boolean;

  // Relations

  @ManyToOne(() => UserEntity)
    user: UserEntity;
}
