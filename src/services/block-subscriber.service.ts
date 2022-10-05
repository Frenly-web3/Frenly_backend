/* eslint-disable no-continue */
import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import moment from 'moment';
import axios from 'axios';
import fs from 'fs';
import { v4 } from 'uuid';

import { UserRepository } from '../repository/user.repository';
import { ProcessedBlocksRepository } from '../repository/processed-blocks.repository';
import { PostRepository } from '../repository/post.repository';

import { BlockchainConfigStorage } from './utils/blockchain-config.storage';

import { ETHMethods } from '../infrastructure/config/const/eth-methods.const';
import { Hex } from '../infrastructure/config/const/hex-const';
import { ErrorMessages } from '../infrastructure/config/const/error-messages.const';
import { FilePaths } from '../infrastructure/config/const/files-paths.const';

import { ERCTokenEnum } from '../infrastructure/config/enums/erc-tokens.enum';
import { BlockchainTypeEnum } from '../infrastructure/config/enums/blockchain-type.enum';
import { PostStatusEnum } from '../infrastructure/config/enums/post-status.enum';

import { IBlockHeader } from './interfaces/blocks/block-header.interface';
import { IERCTransferData } from './interfaces/tokens/erc-transfer-data.interface';
import { ITransactionLog } from './interfaces/transactions/transaction-log.interface';
import { ITransactionReceipt } from './interfaces/transactions/transaction-receipt.interface';

import { ProcessedBlocksEntity } from '../data/entity/processed-blocks.entity';

import { SubscriptionServiceStatus } from '../dto/subscription-service/subscription-service-status.dto';
import { NftPostDto } from '../dto/nft-posts/nft-post.dto';

@Injectable()
export class BlockSubscriberService {
  private readonly logger: Logger;

  private blockchainType: BlockchainTypeEnum;

  private isSubscribed = false;

  private subscriptions = [];

  constructor(
    private readonly blockchainStorage: BlockchainConfigStorage,

    private readonly userRepository: UserRepository,
    private readonly postRepository: PostRepository,

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
      const transferLogs = await this.getERCTransferLogs(transactions);
      const transfersData = await this.getERCTransfersData(transferLogs, type);

      await this.matchAndSaveUsersTransfers(blockHeader, transfersData);

      await this.processedBlockRepository.create(blockHeader.number, type, blockHeader.timestamp);

      this.logger.log(`Processed ${blockHeader.number} block in ${BlockchainTypeEnum[type]} completely.`);
    } catch (error) {
      this.logger.error(error);

      await this.unsubscribe(error);
    }
  }

  private async matchAndSaveUsersTransfers(blockHeader: IBlockHeader, transfers: IERCTransferData[]): Promise<void> {
    const users = await this.userRepository.getAll();

    for (const data of transfers) {
      const transactionMembers = users.filter(
        (x) => x.walletAddress.toLowerCase() === data.fromAddress.toLowerCase()
        || x.walletAddress.toLowerCase() === data.toAddress.toLowerCase(),
      );

      for (const member of transactionMembers) {
        let image = null;

        try {
          if (data.imageURI != null) {
            image = `${data.tokenId}-${v4()}-${new Date().toISOString()}.png`;

            await this.downloadFile(data.imageURI, `${FilePaths.TOKEN_IMAGES}/${image}`);
          }
        } catch (e) {
          image = null;
        }

        const content: NftPostDto = {
          blockchainType: data.blockchainType,
          transactionHash: data.transactionHash,
          fromAddress: data.fromAddress,
          toAddress: data.toAddress,
          smartContractAddress: data.contractAddress,
          tokenId: data.tokenId.toString(),
          tokenType: data.type,
          metadataUri: data.tokenURI,
          blockNumber: blockHeader.number,
          image,
        };

        const creationDate = moment.unix(Number(blockHeader.timestamp)).toDate();
        const updateDate = moment.unix(Number(blockHeader.timestamp)).toDate();

        const postStatus = PostStatusEnum.PENDING;

        await this.postRepository.createNftTokenPost(
          member.id,
          content,

          postStatus,

          creationDate,
          updateDate,
        );

        this.logger.log(`
          Found and added user: (${member.walletAddress}),
          Blockchain: ${BlockchainTypeEnum[data.blockchainType]},
          Action at block: ${blockHeader.number},
          Token id: ${data.tokenId}.
        `);
      }
    }
  }

  private async getTransactionsFromBlockHeader(blockHeader: IBlockHeader, type: BlockchainTypeEnum): Promise<ITransactionReceipt[]> {
    const { web3 } = this.blockchainStorage.getConfig(type);

    const block = await web3.eth.getBlock(blockHeader.hash);
    const transactionReceipts: Promise<ITransactionReceipt>[] = [];

    for (const transactionHash of block?.transactions ?? []) {
      const receipt = web3.eth.getTransactionReceipt(transactionHash);
      transactionReceipts.push(receipt);
    }

    return Promise.all(transactionReceipts);
  }

  private async getERCTransferLogs(transactions: ITransactionReceipt[]): Promise<ITransactionLog[]> {
    const transferLogs: ITransactionLog[] = [];

    for (const transaction of transactions) {
      for (const log of transaction?.logs ?? []) {
        const methodTopic = log.topics[0];

        if (
          ETHMethods.TRANSFER_METHODS.includes(methodTopic)
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
      const baseContract = NFTContractFactory.createBaseContract(log.address.toLowerCase());

      const users = await this.userRepository.getAll();
      const topicAddresses = log.topics.map((e) => this.topicToWalletAddress(e));

      const intersection = users.filter((e) => topicAddresses.includes(e.walletAddress));

      if (intersection.length !== 0 && await baseContract.isContractAddress(log.address.toLowerCase())) {
        if (await baseContract.isERC721Contract()) {
          const erc721TransferData = await this.transactionLogToERC721TransferData(log, type);
          ERCTransfers.push(erc721TransferData);
        }

        if (await baseContract.isERC1155Contract()) {
          const erc1155TransferData = await this.transactionLogToERC1155TransferData(log, type);
          ERCTransfers.push(erc1155TransferData);
        }
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

    for (const missedBlockNumber of missedBlockNumbers) {
      const missedBlock = await web3.eth.getBlock(missedBlockNumber);
      await this.onBlockHeader(type, missedBlock);
    }
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
    const tokenURI = await baseContract.ERC721tokenURI(tokenId);

    return {
      transactionHash: transactionLog.transactionHash,
      logIndex: transactionLog.logIndex,
      type: ERCTokenEnum.ERC_721,
      contractAddress: transactionLog.address.toLowerCase(),
      tokensAmount: 1,
      tokenId,
      blockchainType: type,
      tokenURI,
      tokenName: await baseContract.tokenName(),
      fromAddress: transactionLog.topics[1].replace(ETHMethods.EXTRA_BITS_PER_METHOD_ADDRESS, Hex.PREFIX).toLowerCase(),
      toAddress: transactionLog.topics[2].replace(ETHMethods.EXTRA_BITS_PER_METHOD_ADDRESS, Hex.PREFIX).toLowerCase(),
      imageURI: await this.getTokenImageURI(tokenURI),
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

    const tokenURI = await baseContract.ERC1155tokenURI(tokenId);

    return {
      transactionHash: transactionLog.transactionHash,
      logIndex: transactionLog.logIndex,
      type: ERCTokenEnum.ERC_1155,
      contractAddress: transactionLog.address.toLowerCase(),
      tokensAmount,
      tokenId,
      blockchainType: type,
      tokenURI,
      tokenName: '',
      fromAddress: transactionLog.topics[2].replace(ETHMethods.EXTRA_BITS_PER_METHOD_ADDRESS, Hex.PREFIX).toLowerCase(),
      toAddress: transactionLog.topics[3].replace(ETHMethods.EXTRA_BITS_PER_METHOD_ADDRESS, Hex.PREFIX).toLowerCase(),
      imageURI: await this.getTokenImageURI(tokenURI),
    };
  }

  // Additional Helpers

  private topicToWalletAddress(topic: string): string {
    return topic.replace(ETHMethods.EXTRA_BITS_PER_METHOD_ADDRESS, Hex.PREFIX).toLowerCase();
  }

  private async getTokenImageURI(tokenURI: string): Promise<string> {
    try {
      const { data } = await axios.get(tokenURI);

      if (data?.image != null) {
        return data?.image;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private async downloadFile(fileUrl: string, outputLocationPath: string): Promise<void> {
    const writer = fs.createWriteStream(outputLocationPath);

    const { data } = await axios.get(fileUrl, {
      responseType: 'stream',
      maxBodyLength: 1000000000000000,
      maxContentLength: 1000000000000000,
      timeout: 20000,
    });

    data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        writer.close();
        resolve(null);
      });
      writer.on('error', reject);
    });
  }
}
