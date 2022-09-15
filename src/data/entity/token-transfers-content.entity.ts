import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { BlockchainTypeEnum } from '../../infrastructure/config/enums/blockchain-type.enum';
import { ERCTokenEnum } from '../../infrastructure/config/enums/erc-tokens.enum';
import { TokenContentStatusEnum } from '../../infrastructure/config/enums/token-content-status.enum';

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

  @Column({ name: 'token_id' })
    tokenId: string;

  @Column({ name: 'metadata_URI', nullable: true })
    metadataUri: string;

  @Column({ name: 'token_type', enum: ERCTokenEnum })
    tokenType: ERCTokenEnum;

  @Column({ enum: TokenContentStatusEnum, default: TokenContentStatusEnum.UNPUBLISHED })
    status: TokenContentStatusEnum;

  @Column({ name: 'blockchain_type', enum: BlockchainTypeEnum, default: BlockchainTypeEnum.ETHEREUM })
    blockchainType: BlockchainTypeEnum;

  @Column({ name: 'block_number' })
    blockNumber: number;

  @Column({ name: 'is_removed', default: false })
    isRemoved: Boolean;
}
