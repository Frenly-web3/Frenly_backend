import { IsString } from 'class-validator';

export class RepostDescriptionDto {
  @IsString()
    description: string;
}
