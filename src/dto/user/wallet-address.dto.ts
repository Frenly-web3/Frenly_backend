import { IsEthereumAddress } from 'class-validator';

export class WalletAddressDto {
  @IsEthereumAddress()
    walletAddress: string;
}
