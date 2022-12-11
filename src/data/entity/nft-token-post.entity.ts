import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { NftTokenPostRepository } from '../../repository/nft-token-post.repository';

import { NftMetadataEntity } from './nft-metadata.entity';
import { PostEntity } from './post.entity';

@Entity({ tableName: 'nft_token_post', customRepository: () => NftTokenPostRepository })
export class NftTokenPostEntity {
  @PrimaryKey()
    id!: number;

  @Property({ name: 'tx_hash' })
    txHash: string;

  @Property({ name: 'token_id' })
    tokenId: string;

  @Property({ name: 'from_address' })
    fromAddress: string;

  @Property({ name: 'to_address' })
    toAddress: string;

  @Property({ name: 'sc_address' })
    scAddress: string;

  @Property({ name: 'block_number' })
    blockNumber: number;

  @Property({ name: 'lens_id', nullable: true })
    lensId: string;

  @Property({ name: 'is_mirror', default: false })
    isMirror: boolean;

  @Property({ name: 'mirror_description', nullable: true })
    mirrorDescription: string;

  // Relations

  @OneToOne(() => PostEntity, (post) => post.nftPost, { nullable: true, orphanRemoval: true })
    post: PostEntity;

  @OneToOne(() => NftMetadataEntity, (metadata) => metadata.nftPost, { owner: true })
    metadata: NftMetadataEntity;
}
