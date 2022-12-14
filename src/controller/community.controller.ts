import { CommunityIdDto } from 'src/dto/community/community-id.dto';
import { Controller, Post, UseGuards, Body, Get, Query, Param, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PagingData } from 'src/dto/paging-data.dto';
import { CommunitiesLookUpDto } from 'src/dto/community/communities-look-up.dto';
import { UserRole } from 'src/infrastructure/config/enums/users-role.enum';
import { Roles } from 'src/infrastructure/middlewares/guards/roles.decorator';
import { RolesGuard } from 'src/infrastructure/middlewares/guards/roles.guard';
import { ImageFileFolder } from 'src/infrastructure/config/enums/image-file-folder.enum';
import { ImageFilesInterceptor } from 'src/infrastructure/middlewares/interceptors/image-files.interceptor';
import { CreateCommunityDto } from '../dto/community/create-community.dto';
import { CommunityService } from '../services/community.service';

@Controller('community')
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
  ) {}

  @Get()
  @UseGuards(AuthGuard())
  public async getAll(
    @Query() { take, skip }: PagingData,
  ): Promise<CommunitiesLookUpDto[]> {
    return this.communityService.getAllCommunities(take, skip);
  }

  @Get('/:communityId')
  @UseGuards(AuthGuard())
  public async getCommunity(
    @Param() { communityId }: CommunityIdDto,
  ): Promise<CommunitiesLookUpDto> {
    return this.communityService.getCommunity(communityId);
  }

  @Post('create')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  @UseInterceptors(ImageFilesInterceptor([{ name: 'image', maxCount: 1 }], ImageFileFolder.COMMUNITY_IMAGE))
  public async create(
    @Body() createCommunityDto: CreateCommunityDto,
      @UploadedFiles() files: { image?: Express.Multer.File },
  ): Promise<void> {
    return this.communityService.createCommunity(createCommunityDto, files?.image[0]);
  }
}
