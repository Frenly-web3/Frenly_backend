import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'comments' })
export class CommentEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    text: string;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

  // Relations

  @ManyToOne(() => PostEntity, (post) => post.comments)
    post: PostEntity;

  @ManyToOne(() => UserEntity, (user) => user.comments)
    owner: UserEntity;
}
