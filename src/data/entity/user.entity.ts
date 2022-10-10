import { AutoMap } from '@automapper/classes';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../../infrastructure/config/enums/users-role.enum';

import { PostEntity } from './post.entity';
import { RefreshTokenEntity } from './refresh-token.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  @AutoMap()
    id: number;

  @Column({ nullable: true })
    nonce: number;

  @Column({ nullable: true })
    avatar: string;

  @Column({ nullable: true })
    username: string;

  @Column({ nullable: true })
    description: string;

  @Column({ name: 'wallet_address' })
  @AutoMap()
    walletAddress: string;

  @Column({ name: 'has_lens_profile', default: false })
    hasLensProfile: boolean;

  @Column({ enum: UserRole, default: UserRole.BASIC_USER })
    role: UserRole;

  @CreateDateColumn({ name: 'creation_date' })
    creationDate: Date;

  @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;

  // Relations

  @OneToMany(() => RefreshTokenEntity, (token) => token.user)
    refreshTokens: RefreshTokenEntity[];

  @OneToMany(() => PostEntity, (post) => post.owner)
    posts: PostEntity[];
}
