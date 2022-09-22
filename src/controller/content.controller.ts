import { Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ContentService } from '../services/content.service';

import { UserContentDto } from '../dto/content/user-content.dto';
import { ContentIdDto } from '../dto/content/content-id.dto';
import { ContentWithLensIdsDto } from '../dto/content/content-with-lens-ids.dto';
import { PagingData } from '../dto/paging-data.dto';
import { FeedContentDto } from '../dto/content/feed-content.dto';

@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
  ) {}

  @Get()
  public async getFeed(@Query() { take, skip }: PagingData): Promise<FeedContentDto[]> {
    return this.contentService.getFeed(take, skip);
  }

  @Get('unpublished')
  @UseGuards(AuthGuard())
  public async getUnpublished(): Promise<UserContentDto[]> {
    return this.contentService.getUnpublishedContent();
  }

  @Post('/:contentId')
  @UseGuards(AuthGuard())
  public async publishContent(@Param() { contentId }: ContentIdDto): Promise<string> {
    return this.contentService.publishContent(contentId);
  }

  @Put('/:contentId/:lensId')
  @UseGuards(AuthGuard())
  public async bindContentWithLens(@Param() { contentId, lensId }: ContentWithLensIdsDto): Promise<void> {
    return this.contentService.bindContentWithLensId(contentId, lensId);
  }

  @Delete('/:contentId')
  @UseGuards(AuthGuard())
  public async removeContent(@Param() { contentId }: ContentIdDto): Promise<void> {
    return this.contentService.removeContent(contentId);
  }
}
