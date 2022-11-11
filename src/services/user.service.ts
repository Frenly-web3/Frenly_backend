import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import fs from 'fs';

import { CurrentUserService } from './current-user.service';

import { ErrorMessages } from '../infrastructure/config/const/error-messages.const';

import { UserRepository } from '../repository/user.repository';
import { SubscriptionRepository } from '../repository/subscriptions.repository';

import { UserDescriptionDto } from '../dto/user/user-description.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly currentUserService: CurrentUserService,

    private readonly userRepository: UserRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  public async getUserInfo(walletAddress: string): Promise<UserDescriptionDto> {
    const user = await this.userRepository.getOneByWalletAddress(walletAddress.toLowerCase());

    return { avatar: user?.avatar ?? null, username: user?.username ?? null, description: user?.description ?? null };
  }

  public async updateUser(dto: UpdateUserDto): Promise<void> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const user = await this.userRepository.getOneByWalletAddress(walletAddress.toLowerCase());

    if (dto.description != null) {
      user.description = dto.description;
    }

    if (dto.username != null) {
      user.username = dto.username;
    }

    await this.userRepository.save(user);
  }

  public async uploadAvatar(avatar: Express.Multer.File): Promise<void> {
    try {
      const { walletAddress } = this.currentUserService.getCurrentUserInfo();
      const user = await this.userRepository.getOneByWalletAddress(walletAddress.toLowerCase());

      user.avatar = avatar.filename;
      await this.userRepository.save(user);
    } catch (e) {
      const filePath = `./${avatar.path}`;

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      throw e;
    }
  }

  public async subscribe(respondentAddress: string): Promise<void> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();

    const respondent = await this.userRepository.getOneByWalletAddress(respondentAddress.toLowerCase());
    const subscriber = await this.userRepository.getOneByWalletAddress(walletAddress.toLowerCase());

    if (respondent == null || subscriber == null) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    const totalSubscriptions = await this.subscriptionRepository.getUserRespondentsById(subscriber.id);
    const existsSubscription = totalSubscriptions.find((e) => e.id === respondent.id);

    if (existsSubscription != null) {
      throw new BadRequestException(ErrorMessages.USER_ALREADY_SUBSCRIBED);
    }

    await this.subscriptionRepository.createSubscription(respondent.id, subscriber.id);
  }
}
