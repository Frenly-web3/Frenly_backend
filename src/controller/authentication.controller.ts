import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthenticationService } from '../services/authentication.service';

import { JwtPair } from '../dto/jwt/jwt-pair.dto';

import { NonceDto } from '../dto/authentication/nonce.dto';
import { WalletAddressDto } from '../dto/user/wallet-address.dto';
import { SignatureDto } from '../dto/user/signature.dto';
import { GetRefreshTokenDto } from '../dto/jwt/get-refresh-token.dto';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
  ) {}

  @Get('/:walletAddress/lens-profile')
  public async hasLensProfile(@Param() params: WalletAddressDto): Promise<Boolean> {
    const { walletAddress } = params;

    return this.authenticationService.hasLensProfile(walletAddress);
  }

  @Get('/:walletAddress/nonce')
  public async getUserNonce(@Param() params: WalletAddressDto): Promise<NonceDto> {
    const { walletAddress } = params;

    return this.authenticationService.getUserNonce(walletAddress);
  }

  // @Post('/:walletAddress/signature')
  // public async verifySignature(@Param() params: WalletAddressDto, @Body() body: SignatureDto): Promise<JwtPair> {
  //   const { walletAddress } = params;
  //   const { signature } = body;

  //   return this.authenticationService.verifySignature(walletAddress, signature);
  // }

  // @Post('/refresh-token')
  // @UseGuards(AuthGuard())
  // public async refreshToken(@Body() body: GetRefreshTokenDto): Promise<JwtPair> {
  //   const { refreshToken } = body;

  //   return this.authenticationService.refreshTokens(refreshToken);
  // }

  // @Delete('/logout')
  // @UseGuards(AuthGuard())
  // public async logout(@Body() body: GetRefreshTokenDto): Promise<void> {
  //   const { refreshToken } = body;

  //   return this.authenticationService.logout(refreshToken);
  // }
}
