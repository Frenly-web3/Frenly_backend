import { IsString } from 'class-validator';

export class LensMirrorDto {
  @IsString()
    postId: string;
}
