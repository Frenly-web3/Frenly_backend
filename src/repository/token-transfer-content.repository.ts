import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { TokenTransfersContentEntity } from '../data/entity/token-transfers-content.entity';

import { TokenTransferContentDto } from '../dto/token-transfers/token-transfer-content.dto';

@Injectable()
export class TokenTransfersContentRepository {
  private readonly repository: Repository<TokenTransfersContentEntity>;

  constructor(
    @InjectDataSource()
    private readonly connection: DataSource,
  ) {
    this.repository = connection.getRepository(TokenTransfersContentEntity);
  }

  public async getWithIds(ids: number[]): Promise<TokenTransfersContentEntity[]> {
    return this.repository.find({ where: { id: In(ids) } });
  }

  public async create(data: TokenTransferContentDto): Promise<TokenTransfersContentEntity> {
    const transferContent = this.repository.create(data);
    await this.repository.save(transferContent);

    return transferContent;
  }
}
