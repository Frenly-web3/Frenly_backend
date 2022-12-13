import { UserEntity } from 'src/data/entity/user.entity';
import { PostEntity } from '../../data/entity/post.entity';

export class CommentCreateDto {
  post: PostEntity;

  description: string;

  creator: UserEntity;
}
