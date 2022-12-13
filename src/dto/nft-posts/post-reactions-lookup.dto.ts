import { CommentEntity } from '../../data/entity/comment.entity';

export class PostReactionsLookupDto {
  likes: number;

  repostsAmount: number;

  comments: CommentEntity[];

  commentsAmount: number;
}
