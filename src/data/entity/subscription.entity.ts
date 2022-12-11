import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { SubscriptionRepository } from '../../repository/subscriptions.repository';
import { UserEntity } from './user.entity';

@Entity({ tableName: 'subscriptions', customRepository: () => SubscriptionRepository })
export class SubscriptionEntity {
  @PrimaryKey()
    id!: number;

  @ManyToOne(() => UserEntity)
    respondent: UserEntity;

  @ManyToOne(() => UserEntity)
    subscriber: UserEntity;

  @Property({ name: 'creation_date' })
    creationDate = new Date();

  @Property({ name: 'update_date', onUpdate: () => new Date() })
    updateDate = new Date();
}
