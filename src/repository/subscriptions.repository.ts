import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { UserRepository } from './user.repository';

import { SubscriptionEntity } from '../data/entity/subscription.entity';
import { UserEntity } from '../data/entity/user.entity';

@Injectable()
export class SubscriptionRepository {
  private readonly repository: Repository<SubscriptionEntity>;

  constructor(
    @InjectDataSource()
    private readonly connection: DataSource,

    private readonly userRepository: UserRepository,
  ) {
    this.repository = connection.getRepository(SubscriptionEntity);
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

  public async getUserSubscribers(userId: number): Promise<UserEntity[]> {
    const subscriptions = await this.repository.find({
      where: {
        respondent: {
          id: userId,
        },
      },

      relations: ['respondent', 'subscriber'],
    });

    return subscriptions.map((x) => x.respondent);
  }

  public async getUserSubscriptionsAmount(userId: number): Promise<number> {
    try {
      const subscriptionsAmount = await this.repository.count({
        where: {
          subscriber: {
            id: userId,
          },
        },

        relations: ['respondent', 'subscriber'],
      });

      return subscriptionsAmount;
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  public async createSubscription(respondentId: number, subscriberId: number): Promise<SubscriptionEntity> {
    const respondent = await this.userRepository.getOneById(respondentId);
    const subscriber = await this.userRepository.getOneById(subscriberId);

    const entity = this.repository.create({
      respondent,
      subscriber,
    });

    await this.repository.save(entity);

    return entity;
  }

  public async removeSubscription(respondentId: number, subscriberId: number): Promise<void> {
    const subscription = await this.repository.findOne({
      where: {
        subscriber: {
          id: subscriberId,
        },
        respondent: {
          id: respondentId,
        },
      },

      relations: ['respondent', 'subscriber'],
    });

    await this.repository.remove(subscription);
  }
}
