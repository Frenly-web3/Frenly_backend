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

@Injectable()
export class AdminService {
  constructor(
    private readonly authService: AuthenticationService,

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

  public async publishAdminsPost(id: number): Promise<void> {
    const post = await this.postRepository.getPostById(id);

    if (post == null || post.status !== PostStatusEnum.PENDING || post.owner.role !== UserRole.ADDED_BY_ADMIN) {
      throw new NotFoundException(ErrorMessages.CONTENT_NOT_FOUND);
    }

    post.status = PostStatusEnum.PUBLISHED;

    await this.postRepository.save(post);
  }

  // MAPPING

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

      result.push(contentWrapper);
    }

    return result;
  }
}
