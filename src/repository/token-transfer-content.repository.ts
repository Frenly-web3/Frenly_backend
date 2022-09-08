import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';

import { TokenTransfersContentEntity } from '../data/entity/token-transfers-content.entity';

import { TokenTransferContentDto } from '../dto/token-transfers/token-transfer-content.dto';

@Injectable()
export class TokenTransfersContentRepository {
  private readonly repository: Repository<TokenTransfersContentEntity>;

  constructor(
    @InjectDataSource()
    private readonly connection: Connection,
  ) {
    this.repository = connection.getRepository(TokenTransfersContentEntity);
  }

  public async create(data: TokenTransferContentDto): Promise<TokenTransfersContentEntity> {
    const transferContent = this.repository.create(data);
    await this.repository.save(transferContent);

    return transferContent;
  }
}
