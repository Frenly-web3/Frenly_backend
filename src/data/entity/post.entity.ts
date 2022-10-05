/* eslint-disable no-use-before-define */

import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { PostStatusEnum } from '../../infrastructure/config/enums/post-status.enum';

import { UserEntity } from './user.entity';
import { NftTokenPostEntity } from './nft-token-post.entity';

@Entity('post')
export class PostEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ enum: PostStatusEnum, default: PostStatusEnum.PENDING })
    status: PostStatusEnum;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'update_date' })
    updatedAt: Date;

  // Relations

  @ManyToOne(() => UserEntity, (user) => user.posts)
    owner: UserEntity;

  @OneToOne(() => NftTokenPostEntity, (nftPost) => nftPost.post, { nullable: true })
  @JoinColumn({ name: 'post_id' })
    nftPost: NftTokenPostEntity;

  @ManyToOne(() => PostEntity, (post) => post.reposts, { nullable: true })
    originalPost: PostEntity;

  @OneToMany(() => PostEntity, (post) => post.originalPost)
    reposts: PostEntity[];
}
