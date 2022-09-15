import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import moment from 'moment';

import { BlockchainTypeEnum } from '../infrastructure/config/enums/blockchain-type.enum';

import { ProcessedBlocksEntity } from '../data/entity/processed-blocks.entity';

@Injectable()
export class ProcessedBlocksRepository {
  private readonly repository: Repository<ProcessedBlocksEntity>;

  constructor(
    @InjectDataSource()
    private readonly connection: DataSource,
  ) {
    this.repository = connection.getRepository(ProcessedBlocksEntity);
  }

  public async getAll(type: BlockchainTypeEnum): Promise<ProcessedBlocksEntity[]> {
    return this.repository.find({
      where: {
        type,
      },

      order: { blockNumber: 'ASC' },
    });
  }

  public async create(blockNumber: number, type: BlockchainTypeEnum, timestamp: string | number): Promise<ProcessedBlocksEntity> {
    const dateTimestamp = moment.unix(Number(timestamp)).toDate();

    const block = this.repository.create({ blockNumber, type, timestamp: dateTimestamp });
    await this.repository.save(block);

    return block;
  }
}
