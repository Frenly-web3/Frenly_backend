import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import { Logger } from '@nestjs/common';
import Web3 from 'web3';

import BaseContractAbi from '../../../base-contract-abi.json';

export class BaseNFTContract {
  private readonly ERC721_INTERFACE_ID = '0x80ac58cd';

  private readonly ERC1155_INTERFACE_ID = '0xd9b67a26';

  private readonly web3: Web3;

  private contract: Contract;

  private logger = new Logger();

  constructor(
    private readonly provider: string,
    private readonly address: string,
  ) {
    this.web3 = new Web3(this.provider);
    this.contract = new this.web3.eth.Contract(BaseContractAbi as AbiItem[], address);
  }

  public async tokenName(): Promise<string> {
    try {
      const name = await this.contract.methods.name().call();
      return name;
    } catch (e) {
      this.logger.warn('GET_TOKEN_NAME');
      this.logger.warn(e);

      if (e?.message === 'connection not open on send()') {
        return await this.tokenName();
      }

      return '';
    }
  }

  public async ERC721tokenURI(tokenId: number | string): Promise<string> {
    try {
      const uri = await this.contract.methods.tokenURI(tokenId).call();
      return uri;
    } catch (e) {
      this.logger.warn('GET_ERC721_URI');
      this.logger.warn(e);

      if (e?.message === 'connection not open on send()') {
        return await this.ERC721tokenURI(tokenId);
      }

      return '';
    }
  }

  public async ERC1155tokenURI(tokenId: number | string): Promise<string> {
    try {
      const uri = await this.contract.methods.URI(tokenId).call();
      return uri;
    } catch (e) {
      this.logger.warn('GET_ERC1155_URI');
      this.logger.warn(e);

      if (e?.message === 'connection not open on send()') {
        return await this.ERC1155tokenURI(tokenId);
      }

      return '';
    }
  }

  public async isContractAddress(walletAddress: string): Promise<boolean> {
    try {
      const addressCode = await this.web3.eth.getCode(walletAddress);

      return addressCode !== '0x';
    } catch (e) {
      this.logger.warn('IS_SC_ADDRESS');
      this.logger.warn(e);

      if (e?.message === 'connection not open on send()') {
        return await this.isContractAddress(walletAddress);
      }

      return false;
    }
  }

  public async isERC721Contract(): Promise<boolean> {
    try {
      const isERC721 = await this.contract.methods.supportsInterface(this.ERC721_INTERFACE_ID).call();
      return isERC721;
    } catch (e) {
      this.logger.warn('IS_ERC721_SC');
      this.logger.warn(e);

      if (e?.message === 'connection not open on send()') {
        return await this.isERC721Contract();
      }

      return false;
    }
  }

  public async isERC1155Contract(): Promise<boolean> {
    try {
      const isERC1155 = await this.contract.methods.supportsInterface(this.ERC1155_INTERFACE_ID).call();
      return isERC1155;
    } catch (e) {
      this.logger.warn('IS_ERC1155_SC');
      this.logger.warn(e);

      if (e?.message === 'connection not open on send()') {
        return await this.isERC1155Contract();
      }

      return false;
    }
  }
}
