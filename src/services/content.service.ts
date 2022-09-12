import { Injectable, NotFoundException } from '@nestjs/common';

import { CurrentUserService } from './current-user.service';

import { UserRepository } from '../repository/user.repository';
import { UserContentRepository } from '../repository/user-content.repository';
import { SubscriptionsRepository } from '../repository/subscriptions.repository';

import { ERCTokenEnum } from '../infrastructure/config/enums/erc-tokens.enum';
import { UserContentType } from '../infrastructure/config/enums/user-content-type.enum';

import { ErrorMessages } from '../infrastructure/config/const/error-messages.const';

import { UserContentEntity } from '../data/entity/user-content.entity';

import { UserContentDto } from '../dto/content/user-content.dto';
import { UserTokenContentDto } from '../dto/content/user-token-content.dto';

@Injectable()
export class ContentService {
  constructor(
    private readonly currentUserService: CurrentUserService,

    private readonly userRepository: UserRepository,
    private readonly contentRepository: UserContentRepository,
    private readonly subscriptionsRepository: SubscriptionsRepository,
  ) {}

  public async getUserContent(walletAddress: string): Promise<UserContentDto[]> {
    const user = await this.userRepository.getOneByWalletAddress(walletAddress);

    if (user == null) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    const content = await this.contentRepository.getContentByUserId(user.id);

    return this.mapUserContent(content);
  }

  public async getUserSubscriptionsContent(): Promise<UserContentDto[]> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const user = await this.userRepository.getOneByWalletAddress(walletAddress);

    const respondents = await this.subscriptionsRepository.getUserRespondentsById(user.id);
    const respondentIds = respondents.map((x) => x.id);

    const contents = await this.contentRepository.getContentByUserManyIds(respondentIds);

    return this.mapUserContent(contents);
  }

  // Mapping methods

  private mapUserContent(contents: UserContentEntity[]): UserContentDto[] {
    const result: UserContentDto[] = [];

    for (const content of contents) {
      const contentWrapper = new UserContentDto();

      contentWrapper.walletAddress = content.owner.walletAddress;
      contentWrapper.creationDate = content.creationDate;

      if (content.childEntityType === UserContentType.TOKEN_TRANSFER) {
        const tokenTransferContent = new UserTokenContentDto();

        const tokenContentEntity = content.userContent;

        tokenTransferContent.blockNumber = tokenContentEntity.blockNumber;
        tokenTransferContent.fromAddress = tokenContentEntity.fromAddress;
        tokenTransferContent.toAddress = tokenContentEntity.toAddress;
        tokenTransferContent.smartContractAddress = tokenContentEntity.smartContractAddress;
        tokenTransferContent.tokenId = tokenContentEntity.tokenId;
        tokenTransferContent.transactionHash = tokenContentEntity.transactionHash;
        tokenTransferContent.metadataUri = tokenContentEntity.metadataUri;

        tokenTransferContent.tokenType = ERCTokenEnum[tokenContentEntity.tokenType];

        contentWrapper.content = tokenTransferContent;
      }

      result.push(contentWrapper);
    }

    return result;
  }
}
