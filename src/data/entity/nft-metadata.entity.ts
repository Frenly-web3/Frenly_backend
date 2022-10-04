import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BlockchainTypeEnum } from '../../infrastructure/config/enums/blockchain-type.enum';
import { ERCTokenEnum } from '../../infrastructure/config/enums/erc-tokens.enum';

import { NftTokenPostEntity } from './nft-token-post.entity';

@Entity('nft_metadata')
export class NftMetadataEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @OneToOne(() => NftTokenPostEntity, (post) => post.metadata, { orphanedRowAction: 'delete' })
  @JoinColumn({ name: 'transfer_id' })
    nftPost: NftTokenPostEntity;

  @Column({ name: 'metadata_uri' })
    metadataUri: string;

  @Column({ name: 'image' })
    image: string;

  @Column({ name: 'blockchain_type', enum: BlockchainTypeEnum })
    blockchainType: BlockchainTypeEnum;

  @Column({ name: 'token_type', enum: ERCTokenEnum })
    tokenType: ERCTokenEnum;
}
