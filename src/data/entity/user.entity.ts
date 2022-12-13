import { AutoMap } from '@automapper/classes';
import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CommentEntity } from './comment.entity';
import { UserRole } from '../../infrastructure/config/enums/users-role.enum';
import { CommunityEntity } from './community.entity';

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

  @OneToMany(() => CommunityEntity, (community) => community.creator)
    createdCommunities: CommunityEntity[];

  @ManyToMany(() => CommunityEntity, (community) => community.members)
    // @JoinTable()
    communitiesMember: CommunityEntity[];

  @ManyToMany(() => PostEntity, (post) => post.likes)
    // @JoinTable()
    likes: PostEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.creator)
    createdComments: CommentEntity[];
}
