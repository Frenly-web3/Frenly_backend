import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, ManyToOne, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('community')
@Unique(['contractAddress'])
export class CommunityEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ name: 'name' })
    name: string;

  @Column({ name: 'contract_address' })
    contractAddress: string;

  // relations
  @ManyToOne(() => UserEntity, (user) => user.createdCommunities, { cascade: true })
    creator: UserEntity;

  @ManyToMany(() => UserEntity, { cascade: true })
  @JoinTable()
    members: UserEntity[];

  @CreateDateColumn({ name: 'creation_date' })
    creationDate: Date;

  @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;
}
