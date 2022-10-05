import { Injectable } from '@nestjs/common';

import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper, MappingProfile } from '@automapper/core';

import { PostEntity } from '../../data/entity/post.entity';
import { NftPostLookupDto } from '../../dto/nft-posts/nft-post-lookup.dto';

@Injectable()
export class MapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap(
        mapper,
        PostEntity,
        NftPostLookupDto,
        forMember(
          (d) => d.blockchainType,
          mapFrom((s) => s.nftPost.metadata.blockchainType),
        ),
        forMember(
          (d) => d.contractAddress,
          mapFrom((s) => s.nftPost.scAddress),
        ),
        forMember(
          (d) => d.creationDate,
          mapFrom((s) => s.createdAt),
        ),
        forMember(
          (d) => d.fromAddress,
          mapFrom((s) => s.nftPost.fromAddress),
        ),
        forMember(
          (d) => d.image,
          mapFrom((s) => s.nftPost.metadata.image),
        ),
        forMember(
          (d) => d.isRepost,
          mapFrom((s) => s.originalPost != null),
        ),
        forMember(
          (d) => d.toAddress,
          mapFrom((s) => s.nftPost.toAddress),
        ),
        forMember(
          (d) => d.tokenId,
          mapFrom((s) => s.nftPost.tokenId),
        ),
        forMember(
          (d) => d.metadataUri,
          mapFrom((s) => s.nftPost.metadata.metadataUri),
        ),
        forMember(
          (d) => d.transactionHash,
          mapFrom((s) => s.nftPost.txHash),
        ),
      );
    };
  }
}
