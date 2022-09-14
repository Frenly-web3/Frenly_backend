import { Controller, Get } from '@nestjs/common';

import { StatsService } from '../services/stats.service';

import { TopPoster } from '../dto/stats/top-poster.dto';

@Controller('stats')
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
  ) {}

  @Get('top-posters')
  public async getTopPosters(): Promise<TopPoster[]> {
    return this.statsService.getTopPosters();
  }
}
