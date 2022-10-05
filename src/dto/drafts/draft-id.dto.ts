import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class DraftIdDto {
  @IsInt()
  @Type(() => Number)
    draftId: number;
}
