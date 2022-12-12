import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { CommunityRepository } from '../repository/community.repository';

import { CurrentUserService } from './current-user.service';
import { IPFSService } from './ipfs.service';

import { UserRepository } from '../repository/user.repository';
import { PostRepository } from '../repository/post.repository';
import { SubscriptionRepository } from '../repository/subscriptions.repository';

import { ErrorMessages } from '../infrastructure/config/const/error-messages.const';

import { PostEntity } from '../data/entity/post.entity';

import { LensMetadata } from './interfaces/lens/lens-metadata.interface';

import { PublicationMetadataAttribute } from '../infrastructure/config/enums/publication-metadata-attributes.enum';
import { BlockchainTypeEnum } from '../infrastructure/config/enums/blockchain-type.enum';
import { PublicationMetadataDisplayType } from '../infrastructure/config/enums/publication-metadata-display-type.enum';
import { PublicationMetadataVersions } from '../infrastructure/config/enums/publication-metadata-version.enum';
import { PublicationMainFocus } from '../infrastructure/config/enums/publication-main-focus.enum';
import { PostStatusEnum } from '../infrastructure/config/enums/post-status.enum';
import { PostTypeEnum } from '../infrastructure/config/enums/post-type.enum';

import { NftPostLookupDto } from '../dto/nft-posts/nft-post-lookup.dto';
import { NftPostDto } from '../dto/nft-posts/nft-post.dto';
import { TransferTypes } from '../infrastructure/config/const/transfer-types.const';
import { CommentMetadataDto } from '../dto/comments/comment-metadata.dto';

@Injectable()
export class FeedService {
  constructor(
    private readonly currentUserService: CurrentUserService,
    private readonly ipfsService: IPFSService,

    private readonly communityRepository: CommunityRepository,
    private readonly userRepository: UserRepository,
    private readonly postRepository: PostRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  public async getFeed(
    take: number,
    skip: number,
  ): Promise<NftPostLookupDto[]> {
    const feed = await this.postRepository.getTotalFeedByUserId(take, skip);

    return this.mapUserContent(feed);
  }

  public async getFilteredFeed(
    take: number,
    skip: number,
  ): Promise<NftPostLookupDto[]> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const user = await this.userRepository.getOneByWalletAddress(
      walletAddress.toLowerCase(),
    );

    // GET SUBSCRIPTION & OWN POSTS

    const subscriptions = await this.subscriptionRepository.getUserRespondentsById(user.id);
    const subscriptionsIds = subscriptions.map((e) => e.id);
    subscriptionsIds.push(user.id);

    const subsPosts = await this.postRepository.getOwnedFeedByUserIds(
      subscriptionsIds,
    );
    const subsPostsIds = subsPosts.map((e) => e.id);

    // GET ADMINS POSTS

    const appPosts = await this.postRepository.getAdminsPublishedPost(
      subsPostsIds,
    );
    const appPostsIds = appPosts.map((e) => e.id);

    // OTHER POSTS

    const otherPosts = await this.postRepository.getTotalFeedWithExclusion([
      ...subsPostsIds,
      ...appPostsIds,
    ]);

    // RESULTS

    const result = [...subsPosts, ...appPosts, ...otherPosts]
      .slice(skip)
      .slice(0, take);

    return this.mapUserContent(result);
  }

  public async getCommunityFeed(
    take: number,
    skip: number,
    communityId: number,
  ): Promise<NftPostLookupDto[]> {
    const community = await this.communityRepository.getOneById(communityId);

    if (!community) {
      throw new NotFoundException('Community is not found');
    }

    const communityMemberIds: number[] = community.members.map((member) => member.id);

    const communityPosts = await this.postRepository.getCommunityFeed(community, communityMemberIds, take, skip);

    // RESULTS

    return this.mapUserContent(communityPosts);
  }

  public async getUnpublishedContent(
    take: number,
    skip: number,
  ): Promise<NftPostLookupDto[]> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const currentUser = await this.userRepository.getOneByWalletAddress(
      walletAddress,
    );

    if (currentUser == null) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    const content = await this.postRepository.getDraftsByUserId(
      currentUser.id,
      take,
      skip,
    );

    return this.mapUserContent(content);
  }

  public async getPublishedContent(
    take: number,
    skip: number,
    walletAddress: string,
  ): Promise<NftPostLookupDto[]> {
    // const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    console.log('walletAddress', walletAddress);
    const currentUser = await this.userRepository.getOneByWalletAddress(
      walletAddress,
    );

    if (currentUser == null) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    const content = await this.postRepository.getOwnedFeedByUserId(
      currentUser.id,
      take,
      skip,
    );

    return this.mapUserContent(content);
  }

  public async getContentMetadata(contentId: number): Promise<string> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const currentUser = await this.userRepository.getOneByWalletAddress(
      walletAddress,
    );

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

    const [mappedContent] = this.mapUserContent([content]);
    const metadata = this.mapContentToMetadata(mappedContent);

    const link = await this.ipfsService.upload(metadata);

    return link;
  }

  public async createCommentMetadata(
    data: CommentMetadataDto,
  ): Promise<string> {
    const metadata = this.mapCommentMetadata(data);
    const link = await this.ipfsService.upload(metadata);

    return link;
  }

  public async publishContent(contentId: number): Promise<void> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const currentUser = await this.userRepository.getOneByWalletAddress(
      walletAddress,
    );

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
  }

  public async bindContentWithLensId(
    contentId: number,
    lensId: string,
  ): Promise<void> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const currentUser = await this.userRepository.getOneByWalletAddress(
      walletAddress,
    );

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

  public async repostContent(postId: number, description: string): Promise<void> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const { id } = await this.userRepository.getOneByWalletAddress(
      walletAddress,
    );

    const post = await this.postRepository.getPostById(postId);

    if (post == null) {
      throw new NotFoundException(ErrorMessages.CONTENT_NOT_FOUND);
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

    const repost = await this.postRepository.createNftTokenPost(
      id,
      content,
      PostStatusEnum.PUBLISHED,
    );

    repost.nftPost.isMirror = true;
    repost.nftPost.lensId = newLensId;
    repost.nftPost.mirrorDescription = description;

    await this.postRepository.save(repost);
  }

  public async removeContent(contentId: number): Promise<void> {
    const { walletAddress } = this.currentUserService.getCurrentUserInfo();
    const currentUser = await this.userRepository.getOneByWalletAddress(
      walletAddress,
    );

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

  private mapCommentMetadata(data: CommentMetadataDto): LensMetadata {
    const attributes: PublicationMetadataAttribute[] = [];

    attributes.push({
      value: data.comment,
      traitType: 'comment',
      displayType: PublicationMetadataDisplayType.string,
    });

    attributes.push({
      value: data.lensId,
      traitType: 'pubId',
      displayType: PublicationMetadataDisplayType.string,
    });

    return {
      version: PublicationMetadataVersions.two,
      metadata_id: v4(),
      description: 'SocialFi nft comment',
      content: data.comment,
      locale: 'en-Us',
      mainContentFocus: PublicationMainFocus.TEXT_ONLY,
      name: `SocialFi comment for ${data.lensId} post`,
      attributes,
    };
  }

  private mapUserContent(contents: PostEntity[]): NftPostLookupDto[] {
    const result: NftPostLookupDto[] = [];

    for (const content of contents) {
      const contentWrapper = new NftPostLookupDto();

      contentWrapper.creationDate = content.createdAt;
      contentWrapper.postType = content.type;
      contentWrapper.id = content.id;

      if (content.type === PostTypeEnum.NFT_TRANSFER) {
        contentWrapper.blockchainType = content.nftPost.metadata.blockchainType;
        contentWrapper.transferType = content.owner.walletAddress === content.nftPost.fromAddress
          ? TransferTypes.SEND
          : TransferTypes.RECEIVE;
        contentWrapper.fromAddress = content.nftPost.fromAddress;
        contentWrapper.toAddress = content.nftPost.toAddress;
        contentWrapper.contractAddress = content.nftPost.scAddress;
        contentWrapper.tokenId = content.nftPost.tokenId;
        contentWrapper.tokenUri = content.nftPost.metadata.metadataUri;
        contentWrapper.transactionHash = content.nftPost.txHash;
        contentWrapper.image = content.nftPost.metadata.image;
        contentWrapper.lensId = content.nftPost.lensId;
        contentWrapper.isMirror = content.nftPost.isMirror;
        contentWrapper.mirrorDescription = content.nftPost.mirrorDescription;
      }

      if (content.type === PostTypeEnum.SELL_ORDER) {
        contentWrapper.image = content.zeroExPost.image;
        contentWrapper.fromAddress = content.owner.walletAddress;
        contentWrapper.sellPrice = Number(content.zeroExPost.price);
        contentWrapper.collectionName = content.zeroExPost.collectionName;
        contentWrapper.signedObject = content.zeroExPost.signedObject;
      }

      if (content.type === PostTypeEnum.SELL_EVENT) {
        contentWrapper.image = content.zeroExPost.image;
        contentWrapper.fromAddress = content.owner.walletAddress;
        contentWrapper.toAddress = content.zeroExPost.walletAddress;
        contentWrapper.sellPrice = Number(content.zeroExPost.price);
        contentWrapper.collectionName = content.zeroExPost.collectionName;
        contentWrapper.signedObject = content.zeroExPost.signedObject;
      }

      if (content.type === PostTypeEnum.BUY_EVENT) {
        contentWrapper.image = content.zeroExPost.image;
        contentWrapper.fromAddress = content.zeroExPost.walletAddress;
        contentWrapper.toAddress = content.owner.walletAddress;
        contentWrapper.sellPrice = Number(content.zeroExPost.price);
        contentWrapper.collectionName = content.zeroExPost.collectionName;
        contentWrapper.signedObject = content.zeroExPost.signedObject;
      }

      result.push(contentWrapper);
    }

    return result;
  }
}
