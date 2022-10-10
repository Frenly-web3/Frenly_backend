import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
    username?: string;

  @IsString()
  @IsOptional()
    description?: string;
}
