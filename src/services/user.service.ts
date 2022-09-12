import { Injectable, NotFoundException } from '@nestjs/common';

import { CurrentUserService } from './current-user.service';

import { SubscriptionsRepository } from '../repository/subscriptions.repository';
import { UserRepository } from '../repository/user.repository';

import { ErrorMessages } from '../infrastructure/config/const/error-messages.const';

@Injectable()
export class UserService {
  constructor(
    private readonly currentUserService: CurrentUserService,

    private readonly userRepository: UserRepository,
    private readonly subscriptionRepository: SubscriptionsRepository,
  ) {}

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
