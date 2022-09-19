import { Transform } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

export class ContentWithLensIdsDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
    contentId: number;

  @IsString()
    lensId: string;
}
