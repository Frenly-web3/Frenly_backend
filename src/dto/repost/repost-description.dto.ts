import { IsOptional, IsString } from 'class-validator';

export class RepostDescriptionDto {
  @IsString()
  @IsOptional()
    description: string;
}
