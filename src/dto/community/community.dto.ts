import { UserEntity } from '../../data/entity/user.entity';

export class CommunityDto {
  name: string;

  contractAddress: string;

  creator: UserEntity;
}
