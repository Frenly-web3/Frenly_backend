import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ERCTokenEnum } from '../../infrastructure/config/enums/erc-tokens.enum';

@Entity('token_transfers_content')
export class TokenTransfersContentEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ name: 'transaction_hash' })
    transactionHash: string;

  @Column({ name: 'from_address' })
    fromAddress: string;

  @Column({ name: 'to_address' })
    toAddress: string;

  @Column({ name: 'smart_contract_address' })
    smartContractAddress: string;

  @Column({ name: 'token_hash' })
    tokenId: string;

  @Column({ name: 'token_type', enum: ERCTokenEnum })
    tokenType: ERCTokenEnum;

  @Column({ name: 'block_number' })
    blockNumber: number;
}
