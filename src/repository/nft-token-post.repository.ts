import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { NftMetadataRepository } from './nft-metadata.repository';

import { NftTokenPostEntity } from '../data/entity/nft-token-post.entity';

import { NftPostDto } from '../dto/nft-posts/nft-post.dto';

// FOR INTERNAL USE
// DO NOT INJECT IN SERVICES

@Injectable()
export class NftTokenPostRepository {
  private readonly repository: Repository<NftTokenPostEntity>;

  constructor(
    @InjectDataSource()
    private readonly connection: DataSource,

    private readonly metadataRepository: NftMetadataRepository,
  ) {
    this.repository = connection.getRepository(NftTokenPostEntity);
  }

  public async create(data: NftPostDto): Promise<NftTokenPostEntity> {
    const entity = this.repository.create({
      txHash: data.transactionHash,
      tokenId: data.tokenId,
      fromAddress: data.fromAddress,
      toAddress: data.toAddress,
      scAddress: data.smartContractAddress,
      blockNumber: data.blockNumber,
    });

    await this.repository.save(entity);

    const metadata = await this.metadataRepository.create(entity, data);
    entity.metadata = metadata;

    return entity;
  }
}
