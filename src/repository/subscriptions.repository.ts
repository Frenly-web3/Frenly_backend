import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { EntityRepository } from '@mikro-orm/postgresql';
import { UserRepository } from './user.repository';

import { SubscriptionEntity } from '../data/entity/subscription.entity';
import { UserEntity } from '../data/entity/user.entity';

@Injectable()
export class SubscriptionRepository extends EntityRepository<SubscriptionEntity> {
  public async getUserRespondentsById(userId: number): Promise<UserEntity[]> {
    try {
      const subscriptions = await this.find(
        {
          subscriber: {
            id: userId,
          },
        },
        {
          populate: ['respondent', 'subscriber'],
        },
      );

      return subscriptions.map((x) => x.respondent);
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  public async getUserSubscribers(userId: number): Promise<UserEntity[]> {
    try {
      const subscriptions = await this.find(
        {
          respondent: {
            id: userId,
          },
        },

        {
          populate: ['respondent', 'subscriber'],
        },
      );

      return subscriptions.map((x) => x.respondent);
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  public async createSubscription(respondent: UserEntity, subscriber: UserEntity): Promise<SubscriptionEntity> {
    try {
      const entity = this.create({
        respondent,
        subscriber,
      });

      await this.persistAndFlush(entity);

      return entity;
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }

  public async removeSubscription(respondentId: number, subscriberId: number): Promise<void> {
    try {
      const subscription = await this.findOne(
        {
          subscriber: {
            id: subscriberId,
          },
          respondent: {
            id: respondentId,
          },
        },
        {

          populate: ['respondent', 'subscriber'],
        },
      );

      if (!subscription) {
        throw new BadRequestException();
      }

      await this.removeAndFlush(subscription);
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }
}
