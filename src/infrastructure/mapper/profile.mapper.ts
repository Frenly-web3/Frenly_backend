import { Injectable } from '@nestjs/common';

import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, Mapper, MappingProfile } from '@automapper/core';

import { UserEntity } from '../../data/entity/user.entity';
import { UserLookupDto } from '../../dto/user/user-lookup.dto';

@Injectable()
export class MapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap(mapper, UserEntity, UserLookupDto);
    };
  }
}
