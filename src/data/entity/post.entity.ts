import { Collection, Enum, ManyToOne, OneToMany, OneToOne, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { PostRepository } from '../../repository/post.repository';
/* eslint-disable no-use-before-define */

import { PostStatusEnum } from '../../infrastructure/config/enums/post-status.enum';
import { PostTypeEnum } from '../../infrastructure/config/enums/post-type.enum';

import { UserEntity } from './user.entity';
import { NftTokenPostEntity } from './nft-token-post.entity';

@Entity({ tableName: 'post', customRepository: () => PostRepository })
export class PostEntity {
  @PrimaryKey()
    id!: number;

  @Enum({ type: () => PostStatusEnum, default: PostStatusEnum.PENDING })
    status: PostStatusEnum;

  @Enum({ type: () => PostTypeEnum, default: PostTypeEnum.NFT_TRANSFER })
    type: PostTypeEnum;

  @Property({ name: 'created_at' })
    createdAt = new Date();

  @Property({ name: 'update_date', onUpdate: () => new Date() })
    updatedAt = new Date();

  // Relations

  @ManyToOne(() => UserEntity)
    owner: UserEntity;

  @OneToOne(() => NftTokenPostEntity, (nftPost) => nftPost.post, { nullable: true, name: 'post_id', owner: true })
    nftPost: NftTokenPostEntity;

  @ManyToOne(() => PostEntity, { nullable: true })
    originalPost: PostEntity;

  @OneToMany(() => PostEntity, (post) => post.originalPost)
    reposts = new Collection<PostEntity>(this);
}
