import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { EntityRepository } from '@mikro-orm/postgresql';
import { UserRepository } from './user.repository';

import { SubscriptionEntity } from '../data/entity/subscription.entity';
import { UserEntity } from '../data/entity/user.entity';

@Injectable()
export class SubscriptionRepository extends EntityRepository<SubscriptionEntity> {
  public async getUserRespondentsById(userId: number): Promise<UserEntity[]> {
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
  }

  public async getUserSubscribers(userId: number): Promise<UserEntity[]> {
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
  }

  // public async createSubscription(respondentId: number, subscriberId: number): Promise<SubscriptionEntity> {
  //   const respondent = await this.userRepository.getOneById(respondentId);
  //   const subscriber = await this.userRepository.getOneById(subscriberId);

  //   const entity = this.repository.create({
  //     respondent,
  //     subscriber,
  //   });

  //   await this.repository.save(entity);

  //   return entity;
  // }

  // public async removeSubscription(respondentId: number, subscriberId: number): Promise<void> {
  //   const subscription = await this.findOne({
  //     where: {
  //       subscriber: {
  //         id: subscriberId,
  //       },
  //       respondent: {
  //         id: respondentId,
  //       },
  //     },

  //     relations: ['respondent', 'subscriber'],
  //   });

  //   await this.removeAndFlush(subscription);
  // }
}
