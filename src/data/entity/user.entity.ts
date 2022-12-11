import { AutoMap } from '@automapper/classes';
import { Collection, Entity, Enum, ManyToMany, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { UserRepository } from '../../repository/user.repository';
import { UserRole } from '../../infrastructure/config/enums/users-role.enum';
import { CommunityEntity } from './community.entity';

import { PostEntity } from './post.entity';
import { RefreshTokenEntity } from './refresh-token.entity';

@Entity({ tableName: 'users', customRepository: () => UserRepository })
export class UserEntity {
  @PrimaryKey()
  @AutoMap()
    id!: number;

  @Property({ nullable: true })
    nonce: number;

  @Property({ nullable: true })
    avatar: string;

  @Property({ nullable: true })
    username: string;

  @Property({ nullable: true })
    description: string;

  @Property({ name: 'wallet_address' })
  @AutoMap()
    walletAddress: string;

  @Property({ name: 'has_lens_profile', default: false })
    hasLensProfile: boolean;

  @Enum({ type: () => UserRole, default: UserRole.BASIC_USER })
    role: UserRole;

  @Property({ name: 'creation_date' })
    creationDate = new Date();

  @Property({ name: 'update_date', onUpdate: () => new Date() })
    updateDate = new Date();

  // Relations

  @OneToMany(() => RefreshTokenEntity, (token) => token.user)
    refreshTokens = new Collection<RefreshTokenEntity>(this);

  @OneToMany(() => PostEntity, (post) => post.owner)
    posts = new Collection<PostEntity>(this);

  @OneToMany(() => CommunityEntity, (community) => community.creator)
    createdCommunities = new Collection<CommunityEntity>(this);

  @ManyToMany(() => CommunityEntity, (community) => community.members, { owner: true })
    communitiesMember = new Collection<CommunityEntity>(this);
}
