import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('processed_blocks')
export class ProcessedBlocksEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ name: 'block_number' })
    blockNumber: number;

  @Column()
    timestamp: Date;
}
