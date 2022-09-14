import { AutoMap } from '@automapper/classes';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { RefreshTokenEntity } from './refresh-token.entity';
import { UserContentEntity } from './user-content.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  @AutoMap()
    id: number;

  @Column({ nullable: true })
    nonce: number;

  @Column({ name: 'wallet_address' })
  @AutoMap()
    walletAddress: string;

  @Column({ name: 'on_creation_block_number' })
    onCreationBlockNumber: number;

  @CreateDateColumn({ name: 'creation_date' })
    creationDate: Date;

  @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;

  // Relations

  @OneToMany(() => RefreshTokenEntity, (token) => token.user)
    refreshTokens: RefreshTokenEntity[];

  @OneToMany(() => UserContentEntity, (content) => content.owner)
    contents: UserContentEntity[];
}
