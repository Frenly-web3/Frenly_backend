import { IsString } from 'class-validator';

export class LensMirrorDto {
  @IsString()
    lensId: string;

  @IsString()
    newLensId: string;
}
