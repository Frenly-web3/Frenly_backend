import { Injectable } from '@nestjs/common';

import fs from 'fs';

import { CurrentUserService } from './current-user.service';

import { UserRepository } from '../repository/user.repository';

import { UserDescriptionDto } from '../dto/user/user-description.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly currentUserService: CurrentUserService,

    private readonly userRepository: UserRepository,
  ) {}

  public async getUserInfo(walletAddress: string): Promise<UserDescriptionDto> {
    const { avatar } = await this.userRepository.getOneByWalletAddress(walletAddress.toLowerCase());

    return { avatar };
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
}
