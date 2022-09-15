import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { bufferToHex, ecrecover, fromRpcSig, hashPersonalMessage, publicToAddress, toBuffer } from 'ethereumjs-util';
import { AbiItem } from 'web3-utils';
import LensContractAbi from '../../lens-profile-proxy-abi.json';

import { ApiConfigService } from '../infrastructure/config/api-config.service';
import { ApiJWTService } from './jwt.service';
import { CurrentUserService } from './current-user.service';

import { UserRepository } from '../repository/user.repository';
import { RefreshTokenRepository } from '../repository/refresh-token.repository';

import { ErrorMessages } from '../infrastructure/config/const/error-messages.const';

import { NonceDto } from '../dto/authentication/nonce.dto';
import { JwtPair } from '../dto/jwt/jwt-pair.dto';

@Injectable()
export class AuthenticationService {
  private readonly web3: Web3;

  private readonly lensContract: Contract;

  constructor(
    private readonly configService: ApiConfigService,

    private readonly jwtService: ApiJWTService,
    private readonly currentUserService: CurrentUserService,

    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {
    this.web3 = new Web3(configService.polygonTestnetHttpInfuraProvider);
    this.lensContract = new this.web3.eth.Contract(LensContractAbi as AbiItem[], this.configService.lensContractAddress);
  }

  public async hasLensProfile(walletAddress: string): Promise<Boolean> {
    walletAddress.toLowerCase();
    const user = await this.userRepository.getOneByWalletAddress(walletAddress);

    if (user == null) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    const lensProfiles = await this.lensContract.methods.balanceOf(walletAddress.toLowerCase()).call();

    user.hasLensProfile = lensProfiles !== 0;
    this.userRepository.save(user);

    return user.hasLensProfile;
  }

  public async getUserNonce(walletAddress: string): Promise<NonceDto> {
    const lowerAddress = walletAddress.toLowerCase();
    let user = await this.userRepository.getOneByWalletAddress(lowerAddress);

    if (user == null) {
      const nonce = await this.generateNonce();
      const currentBlockNumber = await this.getCurrentBlockNumber();

      user = await this.userRepository.create({
        nonce,
        walletAddress: lowerAddress,
        onCreationBlockNumber: currentBlockNumber,
      });
    }

    return { nonce: user.nonce };
  }

  public async verifySignature(walletAddress: string, signature: string): Promise<JwtPair> {
    const lowerAddress = walletAddress.toLowerCase();
    const user = await this.userRepository.getOneByWalletAddress(lowerAddress);

    if (user == null) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    const recoveredAddress = await this.recoverSignature(user.nonce, signature);

    if (user.walletAddress !== recoveredAddress) {
      throw new BadRequestException(ErrorMessages.INVALID_SIGNATURE);
    }

    user.nonce = await this.generateNonce();
    await this.userRepository.save(user);

    return this.jwtService.generateTokensPair(user.id, { walletAddress: user.walletAddress });
  }

  public async refreshTokens(refreshToken: string): Promise<JwtPair> {
    const payload = this.currentUserService.getCurrentUserInfo();
    const user = await this.userRepository.getOneByWalletAddress(payload.walletAddress);

    const storedRefreshToken = await this.jwtService.getStoredRefreshToken(payload.jti, refreshToken);

    if (storedRefreshToken == null) {
      throw new UnauthorizedException(ErrorMessages.INVALID_TOKEN);
    }

    storedRefreshToken.isUsed = true;
    this.refreshTokenRepository.save(storedRefreshToken);

    return this.jwtService.generateTokensPair(user.id, { walletAddress: user.walletAddress });
  }

  public async logout(refreshToken: string): Promise<void> {
    const payload = this.currentUserService.getCurrentUserInfo();

    const storedRefreshToken = await this.jwtService.getStoredRefreshToken(payload.jti, refreshToken);

    if (storedRefreshToken == null) {
      throw new UnauthorizedException(ErrorMessages.INVALID_TOKEN);
    }

    storedRefreshToken.isInvalidated = true;
    this.refreshTokenRepository.save(storedRefreshToken);
  }

  // Helpers

  private async generateNonce(): Promise<number> {
    return Math.floor(Math.random() * 1000000);
  }

  private async getCurrentBlockNumber(): Promise<number> {
    return this.web3.eth.getBlockNumber();
  }

  private async recoverSignature(nonce: number, signature: string): Promise<string> {
    try {
      const message = `Nonce: ${nonce}`;
      const messageHex = bufferToHex(Buffer.from(message));

      const messageBuffer = toBuffer(messageHex);
      const messageHash = hashPersonalMessage(messageBuffer);

      const signatureParams = fromRpcSig(signature);

      const publicKey = ecrecover(
        messageHash,
        signatureParams.v,
        signatureParams.r,
        signatureParams.s,
      );

      const addressBuffer = publicToAddress(publicKey);
      const address = bufferToHex(addressBuffer);

      return address;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
