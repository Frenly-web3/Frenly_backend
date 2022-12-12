import { Entity, Property, Enum, PrimaryKey } from '@mikro-orm/core';
import { ProcessedBlocksRepository } from '../../repository/processed-blocks.repository';

import { BlockchainTypeEnum } from '../../infrastructure/config/enums/blockchain-type.enum';

@Entity({ tableName: 'processed_blocks', customRepository: () => ProcessedBlocksRepository })
export class ProcessedBlocksEntity {
  @PrimaryKey()
    id!: number;

  @Property({ name: 'block_number' })
    blockNumber: number;

  @Enum({ name: 'blockchain_type', type: () => BlockchainTypeEnum })
    type: BlockchainTypeEnum;

  @Property()
    timestamp: string;
}
