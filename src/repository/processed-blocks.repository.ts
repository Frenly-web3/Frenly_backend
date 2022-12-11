import { Injectable } from '@nestjs/common';

import moment from 'moment';

import { EntityRepository } from '@mikro-orm/postgresql';
import { BlockchainTypeEnum } from '../infrastructure/config/enums/blockchain-type.enum';

import { ProcessedBlocksEntity } from '../data/entity/processed-blocks.entity';

@Injectable()
export class ProcessedBlocksRepository extends EntityRepository<ProcessedBlocksEntity> {
  public async getAll(type: BlockchainTypeEnum): Promise<ProcessedBlocksEntity[]> {
    return this.find({
      type,
    }, { orderBy: { blockNumber: 'ASC' } });
  }

  // public async create(blockNumber: number, type: BlockchainTypeEnum, timestamp: string | number): Promise<ProcessedBlocksEntity> {
  //   const dateTimestamp = moment.unix(Number(timestamp)).toDate();

  //   const block = await this.create(blockNumber, type, dateTimestamp);
  //   await this.save(block);

  //   return block;
  // }
}
