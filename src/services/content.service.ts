/* eslint-disable max-len */
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

import { LensMetadata } from './interfaces/lens/lens-metadata.interface';

import { UserContentDto } from '../dto/content/user-content.dto';
import { UserTokenContentDto } from '../dto/content/user-token-content.dto';
import { FeedContentDto } from '../dto/content/feed-content.dto';
import { TokenTransferContentDto } from '../dto/token-transfers/token-transfer-content.dto';

import { PublicationMetadataVersions } from '../infrastructure/config/enums/publication-metadata-version.enum';
import { PublicationMainFocus } from '../infrastructure/config/enums/publication-main-focus.enum';
import { PublicationMetadataAttribute } from '../infrastructure/config/enums/publication-metadata-attributes.enum';
import { PublicationMetadataDisplayType } from '../infrastructure/config/enums/publication-metadata-display-type.enum';

@Injectable()
export class ContentService {
  constructor(
    private readonly currentUserService: CurrentUserService,
    private readonly ipfsService: IPFSService,

    private readonly userRepository: UserRepository,
    private readonly contentRepository: UserContentRepository,
    private readonly tokenTransferContentRepository: TokenTransfersContentRepository,
  ) {}

  public async getFeed(take: number, skip: number): Promise<FeedContentDto[]> {
    const contents: UserContentEntity[] = [];

    const transfers = await this.tokenTransferContentRepository.getAllLensTransfers(take, skip);

    for (const transfer of transfers) {
      const content = await this.contentRepository.getTokenTransferContentById(transfer.id);
      content.userContent = transfer;

      contents.push(content);
    }

    return this.mapUserContentToFeed(contents);
  }

  public async getUnpublishedContent(): Promise<UserContentDto[]> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const currentUser = await this.userRepository.getOneByWalletAddress(walletAddress);

    if (currentUser == null) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    const content = await this.contentRepository.getUnpublishedContent(currentUser.id);

    return this.mapUserContent(content);
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

    const [mappedContent] = this.mapUserContent([content]);
    const metadata = this.mapContentToMetadata(mappedContent);

    const link = await this.ipfsService.upload(metadata);

    return link;
  }

  public async bindContentWithLensId(contentId: number, lensId: string): Promise<void> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const currentUser = await this.userRepository.getOneByWalletAddress(walletAddress);

    if (currentUser == null) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    if (!currentUser.hasLensProfile) {
      throw new BadRequestException(ErrorMessages.NO_LENS_PROFILE);
    }

    const content = await this.contentRepository.getPublishedContentById(contentId);

    if (content == null || content.owner.id !== currentUser.id) {
      throw new NotFoundException(ErrorMessages.CONTENT_NOT_FOUND);
    }

    content.userContent.lensId = lensId;
    await this.tokenTransferContentRepository.save(content.userContent);
  }

  public async repostContent(existsLensId: string, newLensId: string): Promise<void> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const { id } = await this.userRepository.getOneByWalletAddress(walletAddress);

    const transfer = await this.tokenTransferContentRepository.getByLensId(existsLensId);

    if (transfer == null) {
      throw new NotFoundException(ErrorMessages.CONTENT_NOT_FOUND);
    }

    const { owner } = await this.contentRepository.getTokenTransferContentById(transfer.id);

    if (owner.id === id) {
      throw new BadRequestException(ErrorMessages.OWN_POST_REPOST);
    }

    const content: TokenTransferContentDto = {
      transactionHash: transfer.transactionHash,

      fromAddress: transfer.fromAddress,

      toAddress: transfer.toAddress,

      smartContractAddress: transfer.smartContractAddress,

      tokenId: transfer.tokenId,

      tokenType: transfer.tokenType,

      blockchainType: transfer.blockchainType,

      metadataUri: transfer.metadataUri,

      image: transfer.image,

      blockNumber: transfer.blockNumber,
    };

    const { userContent } = await this.contentRepository.createTokenTransferContent(id, content);

    userContent.isMirror = true;
    userContent.lensId = newLensId;
    userContent.status = TokenContentStatusEnum.PUBLISHED;

    await this.tokenTransferContentRepository.save(userContent);
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

  private mapContentToMetadata(data: UserContentDto): LensMetadata {
    const attributes: PublicationMetadataAttribute[] = [];

    attributes.push({
      value: data.content.tokenUri,
      traitType: 'Token URI',
      displayType: PublicationMetadataDisplayType.string,
    });

    attributes.push({
      value: data.content.contractAddress,
      traitType: 'Contract address',
      displayType: PublicationMetadataDisplayType.string,
    });

    attributes.push({
      value: data.content.tokenId,
      traitType: 'Token Id',
      displayType: PublicationMetadataDisplayType.string,
    });

    attributes.push({
      value: data.content.toAddress,
      traitType: 'To address',
      displayType: PublicationMetadataDisplayType.string,
    });

    attributes.push({
      value: data.content.fromAddress,
      traitType: 'From address',
      displayType: PublicationMetadataDisplayType.string,
    });

    attributes.push({
      value: data.content.transferType,
      traitType: 'Transfer type',
      displayType: PublicationMetadataDisplayType.string,
    });

    attributes.push({
      value: `${data.creationDate}`,
      traitType: 'Creation Date',
      displayType: PublicationMetadataDisplayType.date,
    });

    attributes.push({
      value: BlockchainTypeEnum[data.content.blockchainType],
      traitType: 'Blockchain type',
      displayType: PublicationMetadataDisplayType.string,
    });

    attributes.push({
      value: data.content.transactionHash,
      traitType: 'Transaction hash',
      displayType: PublicationMetadataDisplayType.string,
    });

    return {
      version: PublicationMetadataVersions.two,
      metadata_id: data.id.toString(),
      description: 'SocialFi nft transfer post',
      content: 'SocialFi nft transfer post',
      locale: 'en-Us',
      mainContentFocus: PublicationMainFocus.TEXT_ONLY,
      name: `SocialFi Post ${data.id}`,
      attributes,
    };
  }

  private mapUserContent(contents: UserContentEntity[]): UserContentDto[] {
    const result: UserContentDto[] = [];

    for (const content of contents) {
      const contentWrapper = new UserContentDto();

      contentWrapper.creationDate = content.creationDate;
      contentWrapper.id = content.id;

      if (content.childEntityType === UserContentType.TOKEN_TRANSFER) {
        const tokenTransferContent = new UserTokenContentDto();

        const tokenContentEntity = content.userContent;

        tokenTransferContent.blockchainType = tokenContentEntity.blockchainType;
        tokenTransferContent.transferType = content.owner.walletAddress === tokenContentEntity.fromAddress ? TransferTypes.SEND : TransferTypes.RECEIVE;
        tokenTransferContent.fromAddress = tokenContentEntity.fromAddress;
        tokenTransferContent.toAddress = tokenContentEntity.toAddress;
        tokenTransferContent.contractAddress = tokenContentEntity.smartContractAddress;
        tokenTransferContent.tokenId = tokenContentEntity.tokenId;
        tokenTransferContent.tokenUri = tokenContentEntity.metadataUri;
        tokenTransferContent.transactionHash = tokenContentEntity.transactionHash;
        tokenTransferContent.image = tokenContentEntity.image;

        contentWrapper.content = tokenTransferContent;
      }

      result.push(contentWrapper);
    }

    return result;
  }

  private mapUserContentToFeed(contents: UserContentEntity[]): FeedContentDto[] {
    const result: FeedContentDto[] = [];

    for (const content of contents) {
      const contentWrapper = new FeedContentDto();

      contentWrapper.creationDate = content.creationDate;

      if (content.childEntityType === UserContentType.TOKEN_TRANSFER) {
        const tokenContentEntity = content.userContent;

        contentWrapper.blockchainType = tokenContentEntity.blockchainType;
        contentWrapper.fromAddress = tokenContentEntity.fromAddress;
        contentWrapper.toAddress = tokenContentEntity.toAddress;
        contentWrapper.contractAddress = tokenContentEntity.smartContractAddress;
        contentWrapper.tokenId = tokenContentEntity.tokenId;
        contentWrapper.tokenUri = tokenContentEntity.metadataUri;
        contentWrapper.transactionHash = tokenContentEntity.transactionHash;
        contentWrapper.image = tokenContentEntity.image;
        contentWrapper.lensId = tokenContentEntity.lensId;
        contentWrapper.isMirror = tokenContentEntity.isMirror;
      }

      result.push(contentWrapper);
    }

    return result;
  }
}
