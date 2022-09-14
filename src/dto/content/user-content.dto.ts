import { UserTokenContentDto } from './user-token-content.dto';

export class UserContentDto {
  id: number;

  creationDate: Date;

  content: UserTokenContentDto;
}
