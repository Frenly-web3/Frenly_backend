/* eslint-disable no-continue */
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import moment from 'moment';

import { UserRepository } from '../repository/user.repository';
import { UserContentRepository } from '../repository/user-content.repository';
import { ProcessedBlocksRepository } from '../repository/processed-blocks.repository';

import { BlockchainConfigStorage } from './utils/blockchain-config.storage';

import { ETHMethods } from '../infrastructure/config/const/eth-methods.const';
import { Hex } from '../infrastructure/config/const/hex-const';
import { ErrorMessages } from '../infrastructure/config/const/error-messages.const';

import { ERCTokenEnum } from '../infrastructure/config/enums/erc-tokens.enum';
import { BlockchainTypeEnum } from '../infrastructure/config/enums/blockchain-type.enum';

import { IBlockHeader } from './interfaces/blocks/block-header.interface';
import { IERCTransferData } from './interfaces/tokens/erc-transfer-data.interface';
import { ITransactionLog } from './interfaces/transactions/transaction-log.interface';
import { ITransactionReceipt } from './interfaces/transactions/transaction-receipt.interface';

import { ProcessedBlocksEntity } from '../data/entity/processed-blocks.entity';

import { TokenTransferContentDto } from '../dto/token-transfers/token-transfer-content.dto';
import { SubscriptionServiceStatus } from '../dto/subscription-service/subscription-service-status.dto';

@Injectable()
export class BlockSubscriberService {
  private readonly logger: Logger;

  private blockchainType: BlockchainTypeEnum;

  private isSubscribed = false;

  private subscriptions = [];

  constructor(
    private readonly blockchainStorage: BlockchainConfigStorage,

    private readonly userRepository: UserRepository,
    private readonly userContentRepository: UserContentRepository,
    private readonly processedBlockRepository: ProcessedBlocksRepository,
  ) {
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

    const polygonConfig = this.blockchainStorage.getConfig(BlockchainTypeEnum.POLYGON_MAINNET);

    const polygonSubscription = polygonConfig.web3.eth.subscribe('newBlockHeaders')
      .on('data', this.onBlockHeader.bind(this, BlockchainTypeEnum.POLYGON_MAINNET))
      .on('error', this.unsubscribe.bind(this));

    this.subscriptions.push(polygonSubscription);
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

    for (const subscription of this.subscriptions) {
      await subscription.unsubscribe();
    }

    this.subscriptions = [];
  }

  // Main service logic

  private async onBlockHeader(type: BlockchainTypeEnum, blockHeader: IBlockHeader): Promise<void> {
    try {
      const transactions = await this.getTransactionsFromBlockHeader(blockHeader, type);
      const transferLogs = await this.getERCTransferLogs(transactions, type);
      const transfersData = await this.getERCTransfersData(transferLogs, type);

      await this.matchAndSaveUsersTransfers(blockHeader, transfersData);

      await this.processedBlockRepository.create(blockHeader.number, type, blockHeader.timestamp);

      this.logger.log(`Processed ${blockHeader.number} block in ${BlockchainTypeEnum[type]} completely`);
    } catch (error) {
      this.logger.error(`Error on block ${blockHeader.number}:`);

      await this.unsubscribe(error);
    }
  }

  private async matchAndSaveUsersTransfers(blockHeader: IBlockHeader, transfers: IERCTransferData[]): Promise<void> {
    const users = await this.userRepository.getAll();

    for (const data of transfers) {
      const transactionMember = users.find((x) => x.walletAddress === data.fromAddress || x.walletAddress === data.toAddress);

      if (transactionMember != null) {
        const content: TokenTransferContentDto = {
          blockchainType: data.blockchainType,
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
          Found and added user: (${transactionMember.walletAddress}),
          Blockchain: ${BlockchainTypeEnum[data.type]},
          Action at block: ${blockHeader.number},
          Token id: ${data.tokenId}.
        `);
      }
    }
  }

  private async getTransactionsFromBlockHeader(blockHeader: IBlockHeader, type: BlockchainTypeEnum): Promise<ITransactionReceipt[]> {
    const { web3 } = this.blockchainStorage.getConfig(type);

    const block = await web3.eth.getBlock(blockHeader.hash);
    const transactionReceipts: ITransactionReceipt[] = [];

    for (const transactionHash of block?.transactions ?? []) {
      const receipt = await web3.eth.getTransactionReceipt(transactionHash);
      transactionReceipts.push(receipt);
    }

    return transactionReceipts;
  }

  private async getERCTransferLogs(transactions: ITransactionReceipt[], type: BlockchainTypeEnum): Promise<ITransactionLog[]> {
    const { NFTContractFactory } = this.blockchainStorage.getConfig(type);
    const transferLogs: ITransactionLog[] = [];

    for (const transaction of transactions) {
      for (const log of transaction?.logs ?? []) {
        const methodTopic = log.topics[0];

        const baseContract = NFTContractFactory.createBaseContract(log.address);

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

  private async getERCTransfersData(logs: ITransactionLog[], type: BlockchainTypeEnum): Promise<IERCTransferData[]> {
    const { NFTContractFactory } = this.blockchainStorage.getConfig(type);
    const ERCTransfers: IERCTransferData[] = [];

    for (const log of logs) {
      const baseContract = NFTContractFactory.createBaseContract(log.address);

      if (await baseContract.isERC721Contract()) {
        const erc721TransferData = await this.transactionLogToERC721TransferData(log, type);
        ERCTransfers.push(erc721TransferData);
      }

      if (await baseContract.isERC1155Contract()) {
        const erc1155TransferData = await this.transactionLogToERC1155TransferData(log, type);
        ERCTransfers.push(erc1155TransferData);
      }
    }

    return ERCTransfers;
  }

  // On exception logic
  // // Fetch job

  public async fetchMissedBlocks(type: BlockchainTypeEnum): Promise<void> {
    this.logger.log(`Start fetching missing blocks at ${BlockchainTypeEnum[type]}`);

    const totalBlocks = await this.processedBlockRepository.getAll(type);

    if (totalBlocks.length === 0 || totalBlocks.length === 1) {
      this.logger.log("System doesn't process any block yet. Stop fetching successfully");

      return;
    }

    const missedBlockNumbers = await this.getMissedBlocksNumbers(totalBlocks);

    if (missedBlockNumbers.length === 0) {
      this.logger.log('No missed blocks found. Stop fetching successfully');

      return;
    }

    const { web3 } = this.blockchainStorage.getConfig(type);
    const tasks: Promise<void>[] = [];

    for (const missedBlockNumber of missedBlockNumbers) {
      const missedBlock = await web3.eth.getBlock(missedBlockNumber);
      const task = this.onBlockHeader(type, missedBlock);

      tasks.push(task);
    }

    await Promise.all(tasks);
    this.logger.log(`Fetched ${missedBlockNumbers.length} missing blocks at ${BlockchainTypeEnum[type]}. Stop fetching successfully`);
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

  private async transactionLogToERC721TransferData(transactionLog: ITransactionLog, type: BlockchainTypeEnum): Promise<IERCTransferData> {
    const { web3, NFTContractFactory } = this.blockchainStorage.getConfig(type);
    const tokenId = web3.utils.hexToNumberString(transactionLog.topics[3]);

    const baseContract = NFTContractFactory.createBaseContract(transactionLog.address);

    return {
      transactionHash: transactionLog.transactionHash,
      logIndex: transactionLog.logIndex,
      type: ERCTokenEnum.ERC_721,
      contractAddress: transactionLog.address,
      tokensAmount: 1,
      tokenId,
      blockchainType: type,
      tokenURI: await baseContract.ERC721tokenURI(tokenId),
      tokenName: await baseContract.tokenName(),
      fromAddress: transactionLog.topics[1].replace(ETHMethods.EXTRA_BITS_PER_METHOD_ADDRESS, Hex.PREFIX),
      toAddress: transactionLog.topics[2].replace(ETHMethods.EXTRA_BITS_PER_METHOD_ADDRESS, Hex.PREFIX),
    };
  }

  private async transactionLogToERC1155TransferData(transactionLog: ITransactionLog, type: BlockchainTypeEnum): Promise<IERCTransferData> {
    const { web3, NFTContractFactory } = this.blockchainStorage.getConfig(type);
    const baseContract = NFTContractFactory.createBaseContract(transactionLog.address);

    const { data } = transactionLog;
    const dataWithoutHexPrefix = data.replace(Hex.PREFIX, '');

    const tokensIdHex = dataWithoutHexPrefix.substring(0, ETHMethods.BYTES_PER_METHOD_DATA);
    const tokenId = web3.utils.hexToNumberString(`${Hex.PREFIX}${tokensIdHex}`);

    const tokensAmountHex = dataWithoutHexPrefix.substring(ETHMethods.BYTES_PER_METHOD_DATA, dataWithoutHexPrefix.length);
    const tokensAmount = web3.utils.hexToNumberString(`${Hex.PREFIX}${tokensAmountHex}`);

    return {
      transactionHash: transactionLog.transactionHash,
      logIndex: transactionLog.logIndex,
      type: ERCTokenEnum.ERC_1155,
      contractAddress: transactionLog.address,
      tokensAmount,
      tokenId,
      blockchainType: type,
      tokenURI: await baseContract.ERC1155tokenURI(tokenId),
      tokenName: '',
      fromAddress: transactionLog.topics[2].replace(ETHMethods.EXTRA_BITS_PER_METHOD_ADDRESS, Hex.PREFIX),
      toAddress: transactionLog.topics[3].replace(ETHMethods.EXTRA_BITS_PER_METHOD_ADDRESS, Hex.PREFIX),
    };
  }
}
