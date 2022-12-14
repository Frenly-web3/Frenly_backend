import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryColumn({ name: 'token_id', unique: true })
    tokenId: string;

  @Column({ name: 'jwt_id' })
    jwtId: string;

  @CreateDateColumn({ name: 'creation_date' })
    creationDate: Date;

  @Column({ name: 'expiry_date' })
    expiryDate: Date;

  @Column({ name: 'is_used', default: false })
    isUsed: boolean;

  @Column({ name: 'is_invalidated', default: false })
    isInvalidated: boolean;

  // Relations

  @ManyToOne(() => UserEntity, (user) => user.refreshTokens)
    user: UserEntity;
}
