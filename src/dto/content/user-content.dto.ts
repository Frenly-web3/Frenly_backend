import { UserTokenContentDto } from './user-token-content.dto';

export class UserContentDto {
  walletAddress: string;

  creationDate: Date;

  content: UserTokenContentDto;
}
