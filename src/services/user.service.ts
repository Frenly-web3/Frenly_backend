import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

import { CurrentUserService } from './current-user.service';

import { SubscriptionsRepository } from '../repository/subscriptions.repository';
import { UserRepository } from '../repository/user.repository';

import { UserEntity } from '../data/entity/user.entity';

import { ErrorMessages } from '../infrastructure/config/const/error-messages.const';

import { UserLookupDto } from '../dto/user/user-lookup.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectMapper()
    private readonly mapper: Mapper,

    private readonly currentUserService: CurrentUserService,

    private readonly userRepository: UserRepository,
    private readonly subscriptionRepository: SubscriptionsRepository,
  ) {}

  public async getAllUsers(searchString: string = '', take: number = 10, skip: number = 0): Promise<UserLookupDto[]> {
    const users = await this.userRepository.getAll(searchString?.toLowerCase(), take, skip);

    return this.mapper.mapArray(users, UserEntity, UserLookupDto);
  }

  public async createSubscription(respondentAddress: string, subscriberAddress?: string): Promise<number> {
    if (subscriberAddress == null) {
      subscriberAddress = this.currentUserService.getCurrentUserInfo().walletAddress;
    }

    const respondent = await this.userRepository.getOneByWalletAddress(respondentAddress);
    const subscriber = await this.userRepository.getOneByWalletAddress(subscriberAddress);

    if (respondent == null || subscriber == null) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    const { id } = await this.subscriptionRepository.createSubscription(respondent, subscriber);

    return id;
  }
}
