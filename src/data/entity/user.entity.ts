import { AutoMap } from '@automapper/classes';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { CommentEntity } from './comment.entity';
import { LikeEntity } from './like.entity';
import { PostEntity } from './post.entity';
import { RefreshTokenEntity } from './refresh-token.entity';

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

  @Column({ name: 'is_registered', default: false })
    isRegistered: boolean;

  @CreateDateColumn({ name: 'creation_date' })
    creationDate: Date;

  @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;

  // Relations

  @OneToMany(() => RefreshTokenEntity, (token) => token.user)
    refreshTokens: RefreshTokenEntity[];

  @OneToMany(() => PostEntity, (post) => post.owner)
    posts: PostEntity[];

  @OneToMany(() => CommentEntity, (comments) => comments.owner)
    comments: CommentEntity[];

  @OneToMany(() => LikeEntity, (likes) => likes.owner)
    likes: LikeEntity[];
}
