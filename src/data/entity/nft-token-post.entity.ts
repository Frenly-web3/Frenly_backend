import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { NftMetadataEntity } from './nft-metadata.entity';
import { PostEntity } from './post.entity';

@Entity('nft_token_post')
export class NftTokenPostEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ name: 'tx_hash' })
    txHash: string;

  @Column({ name: 'token_id' })
    tokenId: string;

  @Column({ name: 'from_address' })
    fromAddress: string;

  @Column({ name: 'to_address' })
    toAddress: string;

  @Column({ name: 'sc_address' })
    scAddress: string;

  @Column({ name: 'block_number' })
    blockNumber: number;

  @Column({ name: 'lens_id', nullable: true })
    lensId: string;

  @Column({ name: 'is_mirror', default: false })
    isMirror: boolean;

  // Relations

  @OneToOne(() => PostEntity, (post) => post.nftPost, { nullable: true })
    post: PostEntity;

  @OneToOne(() => NftMetadataEntity, (metadata) => metadata.nftPost)
    metadata: NftMetadataEntity;
}
