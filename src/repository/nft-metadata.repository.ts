import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { NftMetadataEntity } from '../data/entity/nft-metadata.entity';
import { NftTokenPostEntity } from '../data/entity/nft-token-post.entity';

import { NftPostDto } from '../dto/nft-posts/nft-post.dto';

// FOR INTERNAL USE
// DO NOT INJECT IN SERVICES

@Injectable()
export class NftMetadataRepository {
  private readonly repository: Repository<NftMetadataEntity>;

  constructor(
    @InjectDataSource()
    private readonly connection: DataSource,
  ) {
    this.repository = connection.getRepository(NftMetadataEntity);
  }

  public async create(nftPost: NftTokenPostEntity, data: NftPostDto): Promise<NftMetadataEntity> {
    const entity = this.repository.create({
      metadataUri: data.metadataUri,
      image: data.image,
      blockchainType: data.blockchainType,
      tokenType: data.tokenType,
      nftPost,
    });

    return this.repository.save(entity);
  }

  public async save(entity: NftMetadataEntity): Promise<NftMetadataEntity> {
    return this.repository.save(entity);
  }
}
