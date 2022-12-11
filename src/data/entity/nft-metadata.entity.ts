import { Entity, Enum, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { NftMetadataRepository } from '../../repository/nft-metadata.repository';
import { BlockchainTypeEnum } from '../../infrastructure/config/enums/blockchain-type.enum';
import { ERCTokenEnum } from '../../infrastructure/config/enums/erc-tokens.enum';

import { NftTokenPostEntity } from './nft-token-post.entity';

@Entity({ tableName: 'nft_metadata', customRepository: () => NftMetadataRepository })
export class NftMetadataEntity {
  @PrimaryKey()
    id!: number;

  @OneToOne(() => NftTokenPostEntity, (post) => post.metadata, { orphanRemoval: true, name: 'transfer_id' })
    nftPost: NftTokenPostEntity;

  @Property({ name: 'metadata_uri', nullable: true })
    metadataUri: string;

  @Property({ name: 'image', nullable: true })
    image: string;

  @Enum({ name: 'blockchain_type', items: () => BlockchainTypeEnum })
    blockchainType: BlockchainTypeEnum;

  @Enum({ name: 'token_type', items: () => ERCTokenEnum })
    tokenType: ERCTokenEnum;
}
