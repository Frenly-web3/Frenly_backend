import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { AuthenticationService } from './authentication.service';

import { PostRepository } from '../repository/post.repository';
import { UserRepository } from '../repository/user.repository';
import { UserRole } from '../infrastructure/config/enums/users-role.enum';
import { NftPostLookupDto } from '../dto/nft-posts/nft-post-lookup.dto';
import { PostEntity } from '../data/entity/post.entity';
import { TransferTypes } from '../infrastructure/config/const/transfer-types.const';
import { PostStatusEnum } from '../infrastructure/config/enums/post-status.enum';
import { ErrorMessages } from '../infrastructure/config/const/error-messages.const';
import { LensMetadata } from './interfaces/lens/lens-metadata.interface';
import { PublicationMetadataAttribute } from '../infrastructure/config/enums/publication-metadata-attributes.enum';
import { PublicationMetadataDisplayType } from '../infrastructure/config/enums/publication-metadata-display-type.enum';
import { BlockchainTypeEnum } from '../infrastructure/config/enums/blockchain-type.enum';
import { PublicationMetadataVersions } from '../infrastructure/config/enums/publication-metadata-version.enum';
import { PublicationMainFocus } from '../infrastructure/config/enums/publication-main-focus.enum';
import { IPFSService } from './ipfs.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly ipfsService: IPFSService,

    private readonly userRepository: UserRepository,
    private readonly postRepository: PostRepository,
  ) {}

  public async addUser(walletAddress: string): Promise<void> {
    const existingUser = await this.userRepository.getOneByWalletAddress(walletAddress.toLowerCase());

    if (existingUser != null) {
      throw new BadRequestException();
    }

    const user = await this.userRepository.create({
      nonce: this.authService.generateNonce(),
      walletAddress: walletAddress.toLowerCase(),
    });

    user.role = UserRole.ADDED_BY_ADMIN;
    await this.userRepository.save(user);
  }

  public async getAdminsPost(take: number, skip: number): Promise<NftPostLookupDto[]> {
    const posts = await this.postRepository.getAdminsPost(take, skip);
    return this.mapUserContent(posts);
  }

  public async publishAdminsPost(id: number): Promise<string> {
    const post = await this.postRepository.getPostById(id);

    if (post == null || post.status !== PostStatusEnum.PENDING || post.owner.role !== UserRole.ADDED_BY_ADMIN) {
      throw new NotFoundException(ErrorMessages.CONTENT_NOT_FOUND);
    }

    post.status = PostStatusEnum.PUBLISHED;

    await this.postRepository.save(post);

    const [mappedContent] = this.mapUserContent([post]);
    const metadata = this.mapContentToMetadata(mappedContent);

    const link = await this.ipfsService.upload(metadata);

    return link;
  }

  public async bindContentWithLensId(contentId: number, lensId: string): Promise<void> {
    const post = await this.postRepository.getPostById(contentId);

    if (post == null || post.status !== PostStatusEnum.PUBLISHED || post.owner.role !== UserRole.ADDED_BY_ADMIN) {
      throw new NotFoundException(ErrorMessages.CONTENT_NOT_FOUND);
    }

    post.nftPost.lensId = lensId;
    await this.postRepository.save(post);
  }

  // MAPPING
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

      result.push(contentWrapper);
    }

    return result;
  }
}
