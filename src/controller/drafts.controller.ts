import { Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { DraftsService } from '../services/drafts.service';

import { PagingData } from '../dto/paging-data.dto';
import { DraftIdDto } from '../dto/drafts/draft-id.dto';

@Controller('drafts')
export class DraftsController {
  constructor(
    private readonly draftsService: DraftsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard())
  public async getDrafts(@Query() { take, skip }: PagingData) {
    return this.draftsService.getDrafts(take, skip);
  }

  @Post('/:draftId')
  @UseGuards(AuthGuard())
  public async publishDraft(@Param() { draftId }: DraftIdDto) {
    return this.draftsService.publishDraft(draftId);
  }

  @Delete('/:draftId')
  @UseGuards(AuthGuard())
  public async unpublishDraft(@Param() { draftId }: DraftIdDto) {
    return this.draftsService.unpublishDraft(draftId);
  }
}
