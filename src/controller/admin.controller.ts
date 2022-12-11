import { Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContentIdDto } from '../dto/nft-posts/content-id.dto';
import { ContentWithLensIdsDto } from '../dto/nft-posts/content-with-lens-id.dto';
import { NftPostLookupDto } from '../dto/nft-posts/nft-post-lookup.dto';
import { PagingData } from '../dto/paging-data.dto';
import { WalletAddressDto } from '../dto/user/wallet-address.dto';
import { UserRole } from '../infrastructure/config/enums/users-role.enum';
import { Roles } from '../infrastructure/middlewares/guards/roles.decorator';
import { RolesGuard } from '../infrastructure/middlewares/guards/roles.guard';
import { AdminService } from '../services/admin.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  public async getAdminPosts(@Query() { take, skip }: PagingData): Promise<NftPostLookupDto[]> {
    return this.adminService.getAdminsPost(take, skip);
  }

  @Get('content/:contentId')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  public async getMetadata(@Param() { contentId }: ContentIdDto): Promise<string> {
    return this.adminService.getAdminsPostMetadata(contentId);
  }

  @Post('user/:walletAddress')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  public async addUser(@Param() { walletAddress }: WalletAddressDto): Promise<void> {
    return this.adminService.addUser(walletAddress);
  }

  @Put('content/:contentId')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  public async publishPost(@Param() { contentId }: ContentIdDto): Promise<void> {
    return this.adminService.publishAdminsPost(contentId);
  }

  // @Put('/bind/:contentId/:lensId')
  // @Roles(UserRole.ADMIN)
  // @UseGuards(AuthGuard(), RolesGuard)
  // public async bindContentWithLens(@Param() { contentId, lensId }: ContentWithLensIdsDto): Promise<void> {
  //   return this.adminService.bindContentWithLensId(contentId, lensId);
  // }

  @Delete('content/:contentId')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  public async removeContent(@Param() { contentId }: ContentIdDto): Promise<void> {
    return this.adminService.removeContent(contentId);
  }
}
