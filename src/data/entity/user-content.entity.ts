import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { UserEntity } from './user.entity';
import { TokenTransfersContentEntity } from './token-transfers-content.entity';

import { UserContentType } from '../../infrastructure/config/enums/user-content-type.enum';

@Entity('user_content')
export class UserContentEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ name: 'child_entity_id' })
    childEntityId: number;

  @Column({ name: 'child_entity_type', enum: UserContentType })
    childEntityType: UserContentType;

  @ManyToOne(() => UserEntity, (user) => user.contents)
    owner: UserEntity;

  @CreateDateColumn({ name: 'creation_date' })
    creationDate: Date;

  @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;

  // Non-column properties
  userContent: TokenTransfersContentEntity;
}
