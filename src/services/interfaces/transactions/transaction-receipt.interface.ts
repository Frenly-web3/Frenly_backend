import { ITransactionEvent } from './transaction-event.interface';
import { ITransactionLog } from './transaction-log.interface';

export interface ITransactionReceipt {
  status: boolean;
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  blockNumber: number;
  from: string;
  to: string;
  contractAddress?: string;
  cumulativeGasUsed: number;
  gasUsed: number;
  effectiveGasPrice: number;
  logs: ITransactionLog[];
  logsBloom: string;
  events?: {
    [eventName: string]: ITransactionEvent;
  };
}
