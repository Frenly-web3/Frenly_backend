import { AutoMap } from '@automapper/classes';

export class UserLookupDto {
  @AutoMap()
    id: number;

  @AutoMap()
    walletAddress: string;
}
