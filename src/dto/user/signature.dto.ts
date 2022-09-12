import { IsHexadecimal } from 'class-validator';

export class SignatureDto {
  @IsHexadecimal()
    signature: string;
}
