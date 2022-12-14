import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';

@Entity('comment')
export class CommentEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    description: string;

  // relations
  @ManyToOne(() => UserEntity, (user) => user.createdComments)
    creator: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.comments)
    post: PostEntity;

  @CreateDateColumn({ name: 'creation_date' })
    creationDate: Date;

  @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;
}
