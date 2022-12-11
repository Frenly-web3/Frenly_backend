import { Entity, ManyToMany, ManyToOne, PrimaryKey, Property, Collection, EntityRepositoryType } from '@mikro-orm/core';
import { CommunityRepository } from '../../repository/community.repository';
import { UserEntity } from './user.entity';

@Entity({ tableName: 'community', customRepository: () => CommunityRepository })
export class CommunityEntity {
  @PrimaryKey()
    id: number;

  @Property({ name: 'name' })
    name: string;

  @Property({ name: 'contract_address', unique: true })
    contractAddress: string;

  // relations
  @ManyToOne(() => UserEntity)
    creator: UserEntity;

  @ManyToMany(() => UserEntity, (user: UserEntity) => user.communitiesMember, { nullable: true })
    members = new Collection<UserEntity>(this);

  @Property({ name: 'creation_date' })
    creationDate = new Date();

  @Property({ name: 'update_date', onUpdate: () => new Date() })
    updateDate = new Date();

    [EntityRepositoryType]?: CommunityRepository;
}
