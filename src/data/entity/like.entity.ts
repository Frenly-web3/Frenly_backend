import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';

@Entity('likes')
export class LikeEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @ManyToOne(() => PostEntity, (post) => post.likes)
    post: PostEntity;

  @ManyToOne(() => UserEntity, (user) => user.likes)
    owner: UserEntity;
}
