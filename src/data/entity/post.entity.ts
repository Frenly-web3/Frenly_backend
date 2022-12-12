import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CommentEntity } from './comment.entity';
/* eslint-disable no-use-before-define */

import { PostStatusEnum } from '../../infrastructure/config/enums/post-status.enum';
import { PostTypeEnum } from '../../infrastructure/config/enums/post-type.enum';

import { UserEntity } from './user.entity';
import { NftTokenPostEntity } from './nft-token-post.entity';
import { ZeroExEntity } from './zeroex.entity';

@Entity('post')
export class PostEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ enum: PostStatusEnum, default: PostStatusEnum.PENDING })
    status: PostStatusEnum;

  @Column({ enum: PostTypeEnum, default: PostTypeEnum.NFT_TRANSFER })
    type: PostTypeEnum;

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

  @OneToOne(() => ZeroExEntity, (post) => post.post, { nullable: true })
  @JoinColumn({ name: 'zero_ex_post_id' })
    zeroExPost: ZeroExEntity;

  @ManyToOne(() => PostEntity, (post) => post.reposts, { nullable: true })
    originalPost: PostEntity;

  @OneToMany(() => PostEntity, (post) => post.originalPost)
    reposts: PostEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.post)
    comments: CommentEntity[];

  @ManyToMany(() => UserEntity)
  @JoinTable()
    likes: UserEntity[];
}
