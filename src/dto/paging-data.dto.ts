import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PagingData {
  @IsString()
  @IsOptional()
    searchString: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
    take: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
    skip: number;
}
