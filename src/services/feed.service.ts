import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { CurrentUserService } from './current-user.service';
import { IPFSService } from './ipfs.service';

import { UserRepository } from '../repository/user.repository';
import { PostRepository } from '../repository/post.repository';

import { ErrorMessages } from '../infrastructure/config/const/error-messages.const';

import { PostEntity } from '../data/entity/post.entity';

import { LensMetadata } from './interfaces/lens/lens-metadata.interface';

import { PublicationMetadataAttribute } from '../infrastructure/config/enums/publication-metadata-attributes.enum';
import { BlockchainTypeEnum } from '../infrastructure/config/enums/blockchain-type.enum';
import { PublicationMetadataDisplayType } from '../infrastructure/config/enums/publication-metadata-display-type.enum';
import { PublicationMetadataVersions } from '../infrastructure/config/enums/publication-metadata-version.enum';
import { PublicationMainFocus } from '../infrastructure/config/enums/publication-main-focus.enum';
import { PostStatusEnum } from '../infrastructure/config/enums/post-status.enum';

import { NftPostLookupDto } from '../dto/nft-posts/nft-post-lookup.dto';
import { NftPostDto } from '../dto/nft-posts/nft-post.dto';
import { TransferTypes } from '../infrastructure/config/const/transfer-types.const';

@Injectable()
export class FeedService {
  constructor(
    private readonly currentUserService: CurrentUserService,
    private readonly ipfsService: IPFSService,

    private readonly userRepository: UserRepository,
    private readonly postRepository: PostRepository,
  ) {}

  public async getFeed(take: number, skip: number): Promise<NftPostLookupDto[]> {
    const feed = await this.postRepository.getTotalFeedByUserId(take, skip);

    return this.mapUserContent(feed);
  }

  public async getUnpublishedContent(): Promise<NftPostLookupDto[]> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const currentUser = await this.userRepository.getOneByWalletAddress(walletAddress);

    if (currentUser == null) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    const content = await this.postRepository.getDraftsByUserId(currentUser.id);

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

    const content = await this.postRepository.getDraftById(contentId);

    if (content == null || content.owner.id !== currentUser.id) {
      throw new NotFoundException(ErrorMessages.CONTENT_NOT_FOUND);
    }

    content.status = PostStatusEnum.PUBLISHED;
    await this.postRepository.save(content);

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

    const content = await this.postRepository.getPostById(contentId);

    if (content == null || content.owner.id !== currentUser.id) {
      throw new NotFoundException(ErrorMessages.CONTENT_NOT_FOUND);
    }

    content.nftPost.lensId = lensId;
    await this.postRepository.save(content);
  }

  public async repostContent(existsLensId: string, newLensId: string): Promise<void> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const { id } = await this.userRepository.getOneByWalletAddress(walletAddress);

    const post = await this.postRepository.getByLensId(existsLensId);

    if (post == null) {
      throw new NotFoundException(ErrorMessages.CONTENT_NOT_FOUND);
    }

    if (post.owner.id === id) {
      throw new BadRequestException(ErrorMessages.OWN_POST_REPOST);
    }

    const content: NftPostDto = {
      transactionHash: post.nftPost.txHash,

      fromAddress: post.nftPost.fromAddress,

      toAddress: post.nftPost.toAddress,

      smartContractAddress: post.nftPost.scAddress,

      tokenId: post.nftPost.tokenId,

      tokenType: post.nftPost.metadata.tokenType,

      blockchainType: post.nftPost.metadata.blockchainType,

      metadataUri: post.nftPost.metadata.metadataUri,

      image: post.nftPost.metadata.image,

      blockNumber: post.nftPost.blockNumber,
    };

    const repost = await this.postRepository.createNftTokenPost(id, content, PostStatusEnum.PUBLISHED);

    repost.nftPost.isMirror = true;
    repost.nftPost.lensId = newLensId;

    await this.postRepository.save(repost);
  }

  public async removeContent(contentId: number): Promise<void> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const currentUser = await this.userRepository.getOneByWalletAddress(walletAddress);

    if (currentUser == null) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    const content = await this.postRepository.getDraftById(contentId);

    if (content == null || content.owner.id !== currentUser.id) {
      throw new NotFoundException(ErrorMessages.CONTENT_NOT_FOUND);
    }

    content.status = PostStatusEnum.UNPUBLISHED;
    await this.postRepository.save(content);
  }

  // Mapping

  private mapContentToMetadata(data: NftPostLookupDto): LensMetadata {
    const attributes: PublicationMetadataAttribute[] = [];

    attributes.push({
      value: data.tokenUri,
      traitType: 'Token URI',
      displayType: PublicationMetadataDisplayType.string,
    });

    attributes.push({
      value: data.contractAddress,
      traitType: 'Contract address',
      displayType: PublicationMetadataDisplayType.string,
    });

    attributes.push({
      value: data.tokenId,
      traitType: 'Token Id',
      displayType: PublicationMetadataDisplayType.string,
    });

    attributes.push({
      value: data.toAddress,
      traitType: 'To address',
      displayType: PublicationMetadataDisplayType.string,
    });

    attributes.push({
      value: data.fromAddress,
      traitType: 'From address',
      displayType: PublicationMetadataDisplayType.string,
    });

    attributes.push({
      value: data.transferType,
      traitType: 'Transfer type',
      displayType: PublicationMetadataDisplayType.string,
    });

    attributes.push({
      value: `${data.creationDate}`,
      traitType: 'Creation Date',
      displayType: PublicationMetadataDisplayType.date,
    });

    attributes.push({
      value: BlockchainTypeEnum[data.blockchainType],
      traitType: 'Blockchain type',
      displayType: PublicationMetadataDisplayType.string,
    });

    attributes.push({
      value: data.transactionHash,
      traitType: 'Transaction hash',
      displayType: PublicationMetadataDisplayType.string,
    });

    attributes.push({
      value: data?.image ?? '',
      traitType: 'image',
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

  private mapUserContent(contents: PostEntity[]): NftPostLookupDto[] {
    const result: NftPostLookupDto[] = [];

    for (const content of contents) {
      const contentWrapper = new NftPostLookupDto();

      contentWrapper.creationDate = content.createdAt;
      contentWrapper.id = content.id;

      contentWrapper.blockchainType = content.nftPost.metadata.blockchainType;
      contentWrapper.transferType = content.owner.walletAddress === content.nftPost.fromAddress ? TransferTypes.SEND : TransferTypes.RECEIVE;
      contentWrapper.fromAddress = content.nftPost.fromAddress;
      contentWrapper.toAddress = content.nftPost.toAddress;
      contentWrapper.contractAddress = content.nftPost.scAddress;
      contentWrapper.tokenId = content.nftPost.tokenId;
      contentWrapper.tokenUri = content.nftPost.metadata.metadataUri;
      contentWrapper.transactionHash = content.nftPost.txHash;
      contentWrapper.image = content.nftPost.metadata.image;
      contentWrapper.lensId = content.nftPost.lensId;
      contentWrapper.isMirror = content.nftPost.isMirror;

      result.push(contentWrapper);
    }

    return result;
  }
}
