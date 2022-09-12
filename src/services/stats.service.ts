import { Injectable } from '@nestjs/common';

import { UserRepository } from '../repository/user.repository';

import { TopPoster } from '../dto/stats/top-poster.dto';

@Injectable()
export class StatsService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  public async getTopPosters(): Promise<TopPoster[]> {
    const topOwners = await this.userRepository.getTopContentOwners();

    return topOwners.map((x) => ({ walletAddress: x[0].walletAddress, contentsAmount: x[1] }));
  }
}
