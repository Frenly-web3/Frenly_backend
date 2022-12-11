import { Injectable } from '@nestjs/common';


// import { NftMetadataRepository } from './nft-metadata.repository';

import { NftTokenPostEntity } from '../data/entity/nft-token-post.entity';

// import { NftPostDto } from '../dto/nft-posts/nft-post.dto';
import { EntityRepository } from '@mikro-orm/postgresql';

// FOR INTERNAL USE
// DO NOT INJECT IN SERVICES

@Injectable()
export class NftTokenPostRepository extends EntityRepository<NftTokenPostEntity> {

  // public async create(data: NftPostDto): Promise<NftTokenPostEntity> {
  //   const entity = this.create({
  //     txHash: data.transactionHash,
  //     tokenId: data.tokenId,
  //     fromAddress: data.fromAddress,
  //     toAddress: data.toAddress,
  //     scAddress: data.smartContractAddress,
  //     blockNumber: data.blockNumber,
  //   });

  //   await this.save(entity);

  //   const metadata = await this.metadataRepository.create(entity, data);
  //   entity.metadata = metadata;

  //   return entity;
  // }

  // public async save(entity: NftTokenPostEntity): Promise<NftTokenPostEntity> {
  //   if (entity?.metadata != null) {
  //     await this.metadataRepository.save(entity.metadata);
  //   }

  //   return this.save(entity);
  // }
}
