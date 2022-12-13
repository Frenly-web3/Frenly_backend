import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostReactionsLookupDto } from 'src/dto/nft-posts/post-reactions-lookup.dto';
import { WalletAddressDto } from '../dto/user/wallet-address.dto';

import { FeedService } from '../services/feed.service';

import { PagingData } from '../dto/paging-data.dto';
import { NftPostLookupDto } from '../dto/nft-posts/nft-post-lookup.dto';
import { ContentIdDto } from '../dto/nft-posts/content-id.dto';
import { LensMirrorDto } from '../dto/nft-posts/lens-mirror.dto';
import { ContentWithLensIdsDto } from '../dto/nft-posts/content-with-lens-id.dto';
import { RepostDescriptionDto } from '../dto/repost/repost-description.dto';
import { CommentMetadataDto } from '../dto/comments/comment-data.dto';

@Controller('content')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  public async getFeed(
    @Query() { take, skip }: PagingData,
  ): Promise<NftPostLookupDto[]> {
    return this.feedService.getFeed(take, skip);
  }

  @Get('filtered')
  @UseGuards(AuthGuard())
  public async getFiltered(
    @Query() { take, skip }: PagingData,
  ): Promise<NftPostLookupDto[]> {
    return this.feedService.getFilteredFeed(take, skip);
  }

  @Get('/community/:communityId')
  @UseGuards(AuthGuard())
  public async getCommunityFeed(
    @Query() { take, skip }: PagingData,
      @Param('communityId') communityId: number,
  ): Promise<NftPostLookupDto[]> {
    return this.feedService.getCommunityFeed(take, skip, communityId);
  }

  @Get('published/:walletAddress')
  @UseGuards(AuthGuard())
  public async getPublished(
    @Query() { take, skip }: PagingData,
      @Param() { walletAddress }: WalletAddressDto,
  ): Promise<NftPostLookupDto[]> {
    return this.feedService.getPublishedContent(take, skip, walletAddress);
  }

  @Get('unpublished')
  @UseGuards(AuthGuard())
  public async getUnpublished(
    @Query() { take, skip }: PagingData,
  ): Promise<NftPostLookupDto[]> {
    return this.feedService.getUnpublishedContent(take, skip);
  }

  @Get('/:contentId/metadata')
  @UseGuards(AuthGuard())
  public async getContentMetadata(
    @Param() { contentId }: ContentIdDto,
  ): Promise<string> {
    return this.feedService.getContentMetadata(contentId);
  }

  @Get('/:contentId/reactions')
  @UseGuards(AuthGuard())
  public async getPostReactions(
    @Param() { contentId }: ContentIdDto,
  ): Promise<PostReactionsLookupDto> {
    return this.feedService.getPostReactions(contentId);
  }

  @Post('/comment/create')
  @UseGuards(AuthGuard())
  public async createComment(
    @Body() data: CommentMetadataDto,
  ): Promise<string> {
    return this.feedService.createComment(data);
  }

  @Post('/:contentId')
  @UseGuards(AuthGuard())
  public async publishContent(
    @Param() { contentId }: ContentIdDto,
  ): Promise<void> {
    return this.feedService.publishContent(contentId);
  }

  @Post('/:postId/repost')
  @UseGuards(AuthGuard())
  public async repostContent(
    @Param() { postId }: LensMirrorDto,
      @Body() { description }: RepostDescriptionDto,
  ): Promise<string> {
    return this.feedService.repostContent(postId, description);
  }

  @Post('/:postId/like')
  @UseGuards(AuthGuard())
  public async likeContent(
    @Param() { postId }: LensMirrorDto,
  ): Promise<void> {
    return this.feedService.likeOrUnlikePost(postId);
  }

  @Get('/:postId/is-liked')
  @UseGuards(AuthGuard())
  public async isLikedContent(
    @Param() { postId }: LensMirrorDto,
  ): Promise<boolean> {
    return this.feedService.getIsPostLikedByUser(postId);
  }

  @Put('/:contentId/:lensId')
  @UseGuards(AuthGuard())
  public async bindContentWithLens(
    @Param() { contentId, lensId }: ContentWithLensIdsDto,
  ): Promise<void> {
    return this.feedService.bindContentWithLensId(contentId, lensId);
  }

  @Delete('/:contentId')
  @UseGuards(AuthGuard())
  public async removeContent(
    @Param() { contentId }: ContentIdDto,
  ): Promise<void> {
    return this.feedService.removeContent(contentId);
  }
}
