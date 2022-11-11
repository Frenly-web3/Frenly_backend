import { IsString } from 'class-validator';

export class CommentMetadataDto {
  @IsString()
    lensId: string;

  @IsString()
    comment: string;
}
