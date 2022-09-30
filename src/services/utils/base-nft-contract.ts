import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';

import BaseContractAbi from '../../../base-contract-abi.json';

export class BaseNFTContract {
  private readonly ERC721_INTERFACE_ID = '0x80ac58cd';

  private readonly ERC1155_INTERFACE_ID = '0xd9b67a26';

  private readonly web3: Web3;

  private contract: Contract;

  private isLocked: boolean = false;

  constructor(
    private readonly provider: string,
    private readonly address: string,
  ) {
    this.web3 = new Web3(provider);
    this.contract = new this.web3.eth.Contract(BaseContractAbi as AbiItem[], address);
  }

  public async tokenName(): Promise<string> {
    try {
      const name = await this.contract.methods.name().call();
      return name;
    } catch (e) {
      return this.contract?.options?.address ?? '';
    }
  }

  public async ERC721tokenURI(tokenId: number | string): Promise<string> {
    try {
      const uri = await this.contract.methods.tokenURI(tokenId).call();
      return uri;
    } catch (e) {
      return '';
    }
  }

  public async ERC1155tokenURI(tokenId: number | string): Promise<string> {
    try {
      const uri = await this.contract.methods.URI(tokenId).call();
      return uri;
    } catch (e) {
      return '';
    }
  }

  public async isContractAddress(walletAddress: string): Promise<boolean> {
    try {
      const addressCode = await this.web3.eth.getCode(walletAddress);

      return addressCode !== '0x';
    } catch (e) {
      return false;
    }
  }

  public async isERC721Contract(): Promise<boolean> {
    try {
      const isERC721 = await this.contract.methods.supportsInterface(this.ERC721_INTERFACE_ID).call();
      return isERC721;
    } catch (e) {
      return false;
    }
  }

  public async isERC1155Contract(): Promise<boolean> {
    try {
      const isERC1155 = await this.contract.methods.supportsInterface(this.ERC1155_INTERFACE_ID).call();
      return isERC1155;
    } catch (e) {
      return false;
    }
  }
}
