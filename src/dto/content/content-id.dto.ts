import { Transform } from 'class-transformer';
import { IsInt } from 'class-validator';

export class ContentIdDto {
  @IsInt()
  @Transform(() => Number)
    contentId: number;
}
