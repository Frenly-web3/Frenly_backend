import { Body, Controller, Get, Param, Put, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserService } from '../services/user.service';

import { ImageFileFolder } from '../infrastructure/config/enums/image-file-folder.enum';
import { ImageFilesInterceptor } from '../infrastructure/middlewares/interceptors/image-files.interceptor';

import { WalletAddressDto } from '../dto/user/wallet-address.dto';
import { UserDescriptionDto } from '../dto/user/user-description.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Get('/:walletAddress')
  public async getUserInfo(@Param() { walletAddress }: WalletAddressDto): Promise<UserDescriptionDto> {
    return this.userService.getUserInfo(walletAddress);
  }

  @Put('')
  @UseGuards(AuthGuard())
  public async updateUser(@Body() dto: UpdateUserDto): Promise<void> {
    return this.userService.updateUser(dto);
  }

  @Put('avatar')
  @UseGuards(AuthGuard())
  @UseInterceptors(ImageFilesInterceptor([{ name: 'avatar', maxCount: 1 }], ImageFileFolder.AVATAR))
  public async uploadAvatar(@UploadedFiles() files: { avatar?: Express.Multer.File }): Promise<void> {
    return this.userService.uploadAvatar(files.avatar[0]);
  }
}
