import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { CurrentUserService } from './current-user.service';
import { IPFSService } from './ipfs.service';

import { UserRepository } from '../repository/user.repository';
import { UserContentRepository } from '../repository/user-content.repository';
import { TokenTransfersContentRepository } from '../repository/token-transfer-content.repository';

import { ErrorMessages } from '../infrastructure/config/const/error-messages.const';
import { TransferTypes } from '../infrastructure/config/const/transfer-types.const';

import { UserContentType } from '../infrastructure/config/enums/user-content-type.enum';
import { TokenContentStatusEnum } from '../infrastructure/config/enums/token-content-status.enum';
import { BlockchainTypeEnum } from '../infrastructure/config/enums/blockchain-type.enum';

import { UserContentEntity } from '../data/entity/user-content.entity';

import { UserContentDto } from '../dto/content/user-content.dto';
import { UserTokenContentDto } from '../dto/content/user-token-content.dto';

@Injectable()
export class ContentService {
  constructor(
    private readonly currentUserService: CurrentUserService,
    private readonly ipfsService: IPFSService,

    private readonly userRepository: UserRepository,
    private readonly contentRepository: UserContentRepository,
    private readonly tokenTransferContentRepository: TokenTransfersContentRepository,
  ) {}

  public async getUnpublishedContent(): Promise<UserContentDto[]> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const currentUser = await this.userRepository.getOneByWalletAddress(walletAddress);

    if (currentUser == null) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    const content = await this.contentRepository.getUnpublishedContent(currentUser.id);

    return this.mapUserContent(walletAddress, content);
  }

  public async publishContent(contentId: number): Promise<string> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const currentUser = await this.userRepository.getOneByWalletAddress(walletAddress);

    if (currentUser == null) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    if (!currentUser.hasLensProfile) {
      throw new BadRequestException(ErrorMessages.NO_LENS_PROFILE);
    }

    const content = await this.contentRepository.getUnpublishedContentById(contentId);

    if (content == null || content.owner.id !== currentUser.id) {
      throw new NotFoundException(ErrorMessages.CONTENT_NOT_FOUND);
    }

    content.userContent.status = TokenContentStatusEnum.PUBLISHED;
    await this.tokenTransferContentRepository.save(content.userContent);

    const [mappedContent] = this.mapUserContent(walletAddress, [content]);
    const link = await this.ipfsService.upload({
      ...mappedContent.content,
      id: content.id,
      creationDate: content.creationDate,
      blockchainType: BlockchainTypeEnum[mappedContent.content.blockchainType],
    });

    return link;
  }

  public async removeContent(contentId: number): Promise<void> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const currentUser = await this.userRepository.getOneByWalletAddress(walletAddress);

    if (currentUser == null) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    const content = await this.contentRepository.getUnpublishedContentById(contentId);

    if (content == null || content.owner.id !== currentUser.id) {
      throw new NotFoundException(ErrorMessages.CONTENT_NOT_FOUND);
    }

    content.userContent.isRemoved = true;
    await this.tokenTransferContentRepository.save(content.userContent);
  }

  // Mapping methods

  private mapUserContent(walletAddress: string, contents: UserContentEntity[]): UserContentDto[] {
    const result: UserContentDto[] = [];

    walletAddress = walletAddress.toLowerCase();

    for (const content of contents) {
      const contentWrapper = new UserContentDto();

      contentWrapper.creationDate = content.creationDate;
      contentWrapper.id = content.id;

      if (content.childEntityType === UserContentType.TOKEN_TRANSFER) {
        const tokenTransferContent = new UserTokenContentDto();

        const tokenContentEntity = content.userContent;

        tokenTransferContent.blockchainType = tokenContentEntity.blockchainType;
        tokenTransferContent.transferType = walletAddress === tokenContentEntity.fromAddress ? TransferTypes.SEND : TransferTypes.RECEIVE;
        tokenTransferContent.fromAddress = tokenContentEntity.fromAddress;
        tokenTransferContent.toAddress = tokenContentEntity.toAddress;
        tokenTransferContent.contractAddress = tokenContentEntity.smartContractAddress;
        tokenTransferContent.tokenId = tokenContentEntity.tokenId;
        tokenTransferContent.tokenUri = tokenContentEntity.metadataUri;

        contentWrapper.content = tokenTransferContent;
      }

      result.push(contentWrapper);
    }

    return result;
  }
}
