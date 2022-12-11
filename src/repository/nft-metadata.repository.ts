import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { NftMetadataEntity } from '../data/entity/nft-metadata.entity';
// import { NftTokenPostEntity } from '../data/entity/nft-token-post.entity';

// import { NftPostDto } from '../dto/nft-posts/nft-post.dto';

// FOR INTERNAL USE
// DO NOT INJECT IN SERVICES

@Injectable()
export class NftMetadataRepository extends EntityRepository<NftMetadataEntity> {

  // public async create(nftPost: NftTokenPostEntity, data: NftPostDto): Promise<NftMetadataEntity> {
  //   const entity = this.create({
  //     metadataUri: data.metadataUri,
  //     image: data.image,
  //     blockchainType: data.blockchainType,
  //     tokenType: data.tokenType,
  //     nftPost,
  //   });

  //   return this.save(entity);
  // }

  public async save(entity: NftMetadataEntity): Promise<NftMetadataEntity> {
    return this.save(entity);
  }
}
