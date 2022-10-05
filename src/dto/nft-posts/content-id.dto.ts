import { Transform } from 'class-transformer';
import { IsInt } from 'class-validator';

export class ContentIdDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
    contentId: number;
}
