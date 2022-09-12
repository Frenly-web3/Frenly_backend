import { IsString } from 'class-validator';

export class GetRefreshTokenDto {
  @IsString()
    refreshToken: string;
}
