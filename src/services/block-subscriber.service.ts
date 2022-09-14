/* eslint-disable no-continue */
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import moment from 'moment';
import Web3 from 'web3';

import { ApiConfigService } from '../infrastructure/config/api-config.service';

import { UserRepository } from '../repository/user.repository';
import { UserContentRepository } from '../repository/user-content.repository';
import { ProcessedBlocksRepository } from '../repository/processed-blocks.repository';

import { BaseNFTContractFactory } from './utils/base-nft-contract.factory';

import { ETHMethods } from '../infrastructure/config/const/eth-methods.const';
import { Hex } from '../infrastructure/config/const/hex-const';
import { ErrorMessages } from '../infrastructure/config/const/error-messages.const';

import { ERCTokenEnum } from '../infrastructure/config/enums/erc-tokens.enum';

import { IBlockHeader } from './interfaces/blocks/block-header.interface';
import { IERCTransferData } from './interfaces/tokens/erc-transfer-data.interface';
import { ITransactionLog } from './interfaces/transactions/transaction-log.interface';
import { ITransactionReceipt } from './interfaces/transactions/transaction-receipt.interface';

import { ProcessedBlocksEntity } from '../data/entity/processed-blocks.entity';

import { TokenTransferContentDto } from '../dto/token-transfers/token-transfer-content.dto';
import { SubscriptionServiceStatus } from '../dto/subscription-service/subscription-service-status.dto';

@Injectable()
export class BlockSubscriberService {
  private readonly ETH_PROVIDER: string;

  private readonly web3: Web3;

  private readonly baseNFTContractFactory: BaseNFTContractFactory;

  private readonly logger: Logger;

  private isSubscribed = false;

  private currentSubscription = null;

  constructor(
    private readonly configService: ApiConfigService,

    private readonly userRepository: UserRepository,
    private readonly userContentRepository: UserContentRepository,
    private readonly processedBlockRepository: ProcessedBlocksRepository,
  ) {
    this.ETH_PROVIDER = configService.infuraWebSocketProvider;
    this.web3 = new Web3(this.ETH_PROVIDER);
    this.baseNFTContractFactory = new BaseNFTContractFactory(this.ETH_PROVIDER);

    this.logger = new Logger();
  }

  public async status(): Promise<SubscriptionServiceStatus> {
    return { isSubscribed: this.isSubscribed };
  }

  public async subscribe(): Promise<void> {
    if (this.isSubscribed) {
      throw new BadRequestException(ErrorMessages.ALREADY_SUBSCRIBED);
    }

    this.isSubscribed = true;

    const subscription = this.web3.eth.subscribe('newBlockHeaders')
      .on('data', this.onBlockHeader.bind(this))
      .on('error', this.unsubscribe.bind(this));

    this.currentSubscription = subscription;
  }

  public async unsubscribe(error: Error): Promise<void> {
    if (!this.isSubscribed) {
      throw new BadRequestException(ErrorMessages.NOT_SUBSCRIBED);
    }

    this.isSubscribed = false;

    if (error != null) {
      this.logger.error(error);
    } else {
      this.logger.warn('Service was unsubscribed without error provided. It was possible user interactions');
    }

    await this.currentSubscription.unsubscribe();
    this.currentSubscription = null;
  }

  // Main service logic

  private async onBlockHeader(blockHeader: IBlockHeader): Promise<void> {
    const transactions = await this.getTransactionsFromBlockHeader(blockHeader);
    const transferLogs = await this.getERCTransferLogs(transactions);
    const transfersData = await this.getERCTransfersData(transferLogs);

    await this.matchAndSaveUsersTransfers(blockHeader, transfersData);

    await this.processedBlockRepository.create(blockHeader.number, blockHeader.timestamp);

    this.logger.log(`Processed ${blockHeader.number} block completely`);
  }

  private async matchAndSaveUsersTransfers(blockHeader: IBlockHeader, transfers: IERCTransferData[]): Promise<void> {
    const users = await this.userRepository.getAll();

    for (const data of transfers) {
      const transactionMember = users.find((x) => x.walletAddress === data.fromAddress || x.walletAddress === data.toAddress);

      if (transactionMember != null) {
        const content: TokenTransferContentDto = {
          transactionHash: data.transactionHash,
          fromAddress: data.fromAddress,
          toAddress: data.toAddress,
          smartContractAddress: data.contractAddress,
          tokenId: data.tokenId.toString(),
          tokenType: data.type,
          metadataUri: data.tokenURI,
          blockNumber: blockHeader.number,
        };

        const creationDate = moment.unix(Number(blockHeader.timestamp)).toDate();
        const updateDate = moment.unix(Number(blockHeader.timestamp)).toDate();

        await this.userContentRepository.createTokenTransferContent(
          transactionMember.id,
          content,

          creationDate,
          updateDate,
        );

        this.logger.log(`
          Found and added user (${transactionMember.walletAddress}) action at block: ${blockHeader.number}. Token id: ${data.tokenId}
        `);
      }
    }
  }

  private async getTransactionsFromBlockHeader(blockHeader: IBlockHeader): Promise<ITransactionReceipt[]> {
    const block = await this.web3.eth.getBlock(blockHeader.hash);
    const transactionReceipts: ITransactionReceipt[] = [];

    for (const transactionHash of block?.transactions ?? []) {
      const receipt = await this.web3.eth.getTransactionReceipt(transactionHash);
      transactionReceipts.push(receipt);
    }

    return transactionReceipts;
  }

  private async getERCTransferLogs(transactions: ITransactionReceipt[]): Promise<ITransactionLog[]> {
    const transferLogs: ITransactionLog[] = [];

    for (const transaction of transactions) {
      for (const log of transaction?.logs ?? []) {
        const methodTopic = log.topics[0];

        const baseContract = this.baseNFTContractFactory.createBaseContract(log.address);

        if (
          ETHMethods.TRANSFER_METHODS.includes(methodTopic)
          && baseContract.isContractAddress(log.address)
        ) {
          transferLogs.push(log);
        }
      }
    }

    return transferLogs;
  }

  private async getERCTransfersData(logs: ITransactionLog[]): Promise<IERCTransferData[]> {
    const ERCTransfers: IERCTransferData[] = [];

    for (const log of logs) {
      const baseContract = this.baseNFTContractFactory.createBaseContract(log.address);

      if (await baseContract.isERC721Contract()) {
        const erc721TransferData = await this.transactionLogToERC721TransferData(log);
        ERCTransfers.push(erc721TransferData);
      }

      if (await baseContract.isERC1155Contract()) {
        const erc1155TransferData = await this.transactionLogToERC1155TransferData(log);
        ERCTransfers.push(erc1155TransferData);
      }
    }

    return ERCTransfers;
  }

  // On exception logic
  // // Fetch job

  public async fetchMissedBlocks(): Promise<void> {
    this.logger.log('Start fetching missing blocks');

    const totalBlocks = await this.processedBlockRepository.getAll();

    if (totalBlocks.length === 0 || totalBlocks.length === 1) {
      this.logger.log("System doesn't process any block yet. Stop fetching successfully");

      return;
    }

    const missedBlockNumbers = await this.getMissedBlocksNumbers(totalBlocks);

    if (missedBlockNumbers.length === 0) {
      this.logger.log('No missed blocks found. Stop fetching successfully');

      return;
    }

    for (const missedBlockNumber of missedBlockNumbers) {
      const missedBlock = await this.web3.eth.getBlock(missedBlockNumber);
      await this.onBlockHeader(missedBlock);
    }

    this.logger.log(`Fetched ${missedBlockNumbers.length} missing blocks. Stop fetching successfully`);
  }

  private async getMissedBlocksNumbers(totalBlocks: ProcessedBlocksEntity[]): Promise<number[]> {
    const missedBlocks: number[] = [];

    for (let blockIndex = 0; blockIndex < totalBlocks.length - 1; blockIndex += 1) {
      const blocksDistance = totalBlocks[blockIndex + 1].blockNumber - totalBlocks[blockIndex].blockNumber;

      if (blocksDistance > 1) {
        const fromBlock = totalBlocks[blockIndex].blockNumber + 1;
        const toBlock = totalBlocks[blockIndex + 1].blockNumber;

        for (let blockNumber = fromBlock; blockNumber < toBlock; blockNumber += 1) {
          missedBlocks.push(blockNumber);
        }
      }
    }

    return missedBlocks;
  }

  // Mapping methods

  private async transactionLogToERC721TransferData(transactionLog: ITransactionLog): Promise<IERCTransferData> {
    const tokenId = this.web3.utils.hexToNumberString(transactionLog.topics[3]);

    const baseContract = this.baseNFTContractFactory.createBaseContract(transactionLog.address);

    return {
      transactionHash: transactionLog.transactionHash,
      logIndex: transactionLog.logIndex,
      type: ERCTokenEnum.ERC_721,
      contractAddress: transactionLog.address,
      tokensAmount: 1,
      tokenId,
      tokenURI: await baseContract.ERC721tokenURI(tokenId),
      tokenName: await baseContract.tokenName(),
      fromAddress: transactionLog.topics[1].replace(ETHMethods.EXTRA_BITS_PER_METHOD_ADDRESS, Hex.PREFIX),
      toAddress: transactionLog.topics[2].replace(ETHMethods.EXTRA_BITS_PER_METHOD_ADDRESS, Hex.PREFIX),
    };
  }

  private async transactionLogToERC1155TransferData(transactionLog: ITransactionLog): Promise<IERCTransferData> {
    const baseContract = this.baseNFTContractFactory.createBaseContract(transactionLog.address);

    const { data } = transactionLog;
    const dataWithoutHexPrefix = data.replace(Hex.PREFIX, '');

    const tokensIdHex = dataWithoutHexPrefix.substring(0, ETHMethods.BYTES_PER_METHOD_DATA);
    const tokenId = this.web3.utils.hexToNumberString(`${Hex.PREFIX}${tokensIdHex}`);

    const tokensAmountHex = dataWithoutHexPrefix.substring(ETHMethods.BYTES_PER_METHOD_DATA, dataWithoutHexPrefix.length);
    const tokensAmount = this.web3.utils.hexToNumberString(`${Hex.PREFIX}${tokensAmountHex}`);

    return {
      transactionHash: transactionLog.transactionHash,
      logIndex: transactionLog.logIndex,
      type: ERCTokenEnum.ERC_1155,
      contractAddress: transactionLog.address,
      tokensAmount,
      tokenId,
      tokenURI: await baseContract.ERC1155tokenURI(tokenId),
      tokenName: '',
      fromAddress: transactionLog.topics[2].replace(ETHMethods.EXTRA_BITS_PER_METHOD_ADDRESS, Hex.PREFIX),
      toAddress: transactionLog.topics[3].replace(ETHMethods.EXTRA_BITS_PER_METHOD_ADDRESS, Hex.PREFIX),
    };
  }
}
