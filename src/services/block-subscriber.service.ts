/* eslint-disable no-continue */
import { Injectable } from '@nestjs/common';
import Web3 from 'web3';

import { ApiConfigService } from '../infrastructure/config/api-config.service';

import { BaseNFTContractFactory } from './utils/base-nft-contract.factory';

import { ETHMethods } from '../infrastructure/config/const/eth-methods.const';
import { Hex } from '../infrastructure/config/const/hex-const';

import { ERCTokenEnum } from '../infrastructure/config/enums/erc-tokens.enum';

import { IBlockHeader } from './interfaces/blocks/block-header.interface';
import { IERCTransferData } from './interfaces/tokens/erc-transfer-data.interface';
import { ITransactionLog } from './interfaces/transactions/transaction-log.interface';
import { ITransactionReceipt } from './interfaces/transactions/transaction-receipt.interface';

@Injectable()
export class BlockSubscriberService {
  private readonly ETH_PROVIDER: string;

  private readonly web3: Web3;

  private readonly baseNFTContractFactory: BaseNFTContractFactory;

  constructor(
    private readonly configService: ApiConfigService,
  ) {
    this.ETH_PROVIDER = configService.infuraWebSocketProvider;
    this.web3 = new Web3(this.ETH_PROVIDER);
    this.baseNFTContractFactory = new BaseNFTContractFactory(this.ETH_PROVIDER);
  }

  public async subscribe(): Promise<void> {
    this.web3.eth.subscribe('newBlockHeaders')
      .on('data', this.onNewBlockHeader.bind(this))
      .on('error', this.unsubscribe);
  }

  public async unsubscribe(error: Error): Promise<void> {
    if (error != null) {
      console.log(error);
    }

    this.web3.eth.clearSubscriptions(null);
  }

  private async onNewBlockHeader(blockHeader: IBlockHeader): Promise<void> {
    const transactions = await this.getTransactionsFromBlockHeader(blockHeader);
    const transferLogs = await this.getERCTransferLogs(transactions);
    const transferData = await this.getERCTransfersData(transferLogs);

    console.log(transferData);
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
      for (const log of transaction.logs ?? []) {
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

  // Mapping methods

  private async transactionLogToERC721TransferData(transactionLog: ITransactionLog): Promise<IERCTransferData> {
    const tokenId = this.web3.utils.hexToNumber(transactionLog.topics[3]);

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
