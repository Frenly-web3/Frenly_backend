import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ContentService } from '../services/content.service';

import { UserContentDto } from '../dto/content/user-content.dto';
import { ContentIdDto } from '../dto/content/content-id.dto';

@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
  ) {}

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

  @Delete('/:contentId')
  @UseGuards(AuthGuard())
  public async removeContent(@Param() { contentId }: ContentIdDto): Promise<void> {
    return this.contentService.removeContent(contentId);
  }
}
