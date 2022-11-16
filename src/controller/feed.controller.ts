import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { FeedService } from '../services/feed.service';

import { PagingData } from '../dto/paging-data.dto';
import { NftPostLookupDto } from '../dto/nft-posts/nft-post-lookup.dto';
import { ContentIdDto } from '../dto/nft-posts/content-id.dto';
import { LensMirrorDto } from '../dto/nft-posts/lens-mirror.dto';
import { ContentWithLensIdsDto } from '../dto/nft-posts/content-with-lens-id.dto';
import { RepostDescriptionDto } from '../dto/repost/repost-description.dto';
import { CommentMetadataDto } from '../dto/comments/comment-metadata.dto';

@Controller('content')
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
  ) {}

  @Get()
  public async getFeed(@Query() { take, skip }: PagingData): Promise<NftPostLookupDto[]> {
    return this.feedService.getFeed(take, skip);
  }

  @Get('filtered')
  @UseGuards(AuthGuard())
  public async getFiltered(@Query() { take, skip }: PagingData): Promise<NftPostLookupDto[]> {
    return this.feedService.getFilteredFeed(take, skip);
  }

  @Get('unpublished')
  @UseGuards(AuthGuard())
  public async getUnpublished(@Query() { take, skip }: PagingData): Promise<NftPostLookupDto[]> {
    return this.feedService.getUnpublishedContent(take, skip);
  }

  @Get('/:contentId/metadata')
  @UseGuards(AuthGuard())
  public async getContentMetadata(@Param() { contentId }: ContentIdDto): Promise<string> {
    return this.feedService.getContentMetadata(contentId);
  }

  @Post('/comment/metadata')
  @UseGuards(AuthGuard())
  public async createCommentMetadata(@Body() data: CommentMetadataDto): Promise<string> {
    return this.feedService.createCommentMetadata(data);
  }

  @Post('/:contentId')
  @UseGuards(AuthGuard())
  public async publishContent(@Param() { contentId }: ContentIdDto): Promise<void> {
    return this.feedService.publishContent(contentId);
  }

  @Post('/:lensId/repost/:newLensId')
  @UseGuards(AuthGuard())
  public async repostContent(@Param() { lensId, newLensId }: LensMirrorDto, @Body() { description }: RepostDescriptionDto): Promise<void> {
    return this.feedService.repostContent(lensId, newLensId, description);
  }

  @Put('/:contentId/:lensId')
  @UseGuards(AuthGuard())
  public async bindContentWithLens(@Param() { contentId, lensId }: ContentWithLensIdsDto): Promise<void> {
    return this.feedService.bindContentWithLensId(contentId, lensId);
  }

  @Delete('/:contentId')
  @UseGuards(AuthGuard())
  public async removeContent(@Param() { contentId }: ContentIdDto): Promise<void> {
    return this.feedService.removeContent(contentId);
  }
}
