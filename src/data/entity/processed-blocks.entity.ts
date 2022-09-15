import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { BlockchainTypeEnum } from '../../infrastructure/config/enums/blockchain-type.enum';

@Entity('processed_blocks')
export class ProcessedBlocksEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ name: 'block_number' })
    blockNumber: number;

  @Column({ name: 'blockchain_type', enum: BlockchainTypeEnum })
    type: BlockchainTypeEnum;

  @Column()
    timestamp: Date;
}
