import { Transform } from 'class-transformer';
import { IsInt, Min} from 'class-validator';

export class CommunityIdDto {
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
    communityId: number;
}
