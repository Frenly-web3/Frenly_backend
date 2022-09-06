import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PolymorphicParent } from 'typeorm-polymorphic';
import { PolymorphicChildInterface } from 'typeorm-polymorphic/dist/polymorphic.interface';
import { ERCTokenEnum } from '../../infrastructure/config/enums/erc-tokens.enum';
import { UserContentEntity } from './user-content.entity';

@Entity('token_transfers_content')
export class TokenTransfersContentEntity implements PolymorphicChildInterface {
  @PrimaryGeneratedColumn()
    entityId: number;

  @Column({ name: 'transaction_hash' })
    transactionHash: string;

  @Column({ name: 'from_address' })
    fromAddress: string;

  @Column({ name: 'to_address' })
    toAddress: string;

  @Column({ name: 'smart_contract_address' })
    smartContractAddress: string;

  @Column({ name: 'token_hash' })
    tokenHash: string;

  @Column({ name: 'token_type', enum: ERCTokenEnum })
    tokenType: ERCTokenEnum;

  @Column({ name: 'block_number' })
    blockNumber: number;

  @Column()
    entityType: string;

  @PolymorphicParent(() => UserContentEntity)
    content: UserContentEntity;
}
