import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PolymorphicChildren } from 'typeorm-polymorphic';
import { TokenTransfersContentEntity } from './token-transfers-content.entity';
import { UserEntity } from './user.entity';

@Entity('user_content')
export class UserContentEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @ManyToOne(() => UserEntity, (user) => user.contents)
    owner: UserEntity;

  @PolymorphicChildren(() => [TokenTransfersContentEntity])
    content: TokenTransfersContentEntity[];

  @CreateDateColumn({ name: 'creation_date' })
    creationDate: Date;

  @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;
}
