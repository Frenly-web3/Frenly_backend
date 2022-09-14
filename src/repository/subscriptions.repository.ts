import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';

import { SubscriptionEntity } from '../data/entity/subscription.entity';
import { UserEntity } from '../data/entity/user.entity';

export class SubscriptionsRepository {
  private readonly repository: Repository<SubscriptionEntity>;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    this.repository = dataSource.getRepository(SubscriptionEntity);
  }

  public async getUserRespondentsById(userId: number): Promise<UserEntity[]> {
    const subscriptions = await this.repository.find({
      where: {
        subscriber: {
          id: userId,
        },
      },

      relations: ['respondent', 'subscriber'],
    });

    return subscriptions.map((x) => x.respondent);
  }

  public async createSubscription(respondent: UserEntity, subscriber: UserEntity): Promise<SubscriptionEntity> {
    const entity = this.repository.create({
      respondent,
      subscriber,
    });

    await this.repository.save(entity);

    return entity;
  }
}
