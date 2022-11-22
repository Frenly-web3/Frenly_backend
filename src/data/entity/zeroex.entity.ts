import { AutoMap } from '@automapper/classes';
import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { PostEntity } from './post.entity';

@Entity('zeroex_post')
export class ZeroExEntity {
  @PrimaryGeneratedColumn()
  @AutoMap()
    id: number;

  @Column({ nullable: true })
    image: string;

  @Column({ name: 'wallet_address' })
    walletAddress: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
    price: number;

  @Column({ name: 'collection_name' })
    collectionName: string;

  @Column({ name: 'signed_object' })
    signedObject: string;

  @CreateDateColumn({ name: 'creation_date' })
    creationDate: Date;

  @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;

  // Relations

  @OneToOne(() => PostEntity, (post) => post.zeroExPost, { nullable: true })
    post: PostEntity;
}
