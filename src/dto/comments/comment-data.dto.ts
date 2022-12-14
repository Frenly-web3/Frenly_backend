import { IsNumber, IsString } from 'class-validator';

export class CommentMetadataDto {
  @IsNumber()
    postId: number;

  @IsString()
    comment: string;
}
