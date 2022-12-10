import { Controller, Post, UseGuards, Body, Get, Query, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PagingData } from 'src/dto/paging-data.dto';
import { CommunitiesLookUpDto } from 'src/dto/community/communities-look-up.dto';
import { UserRole } from 'src/infrastructure/config/enums/users-role.enum';
import { Roles } from 'src/infrastructure/middlewares/guards/roles.decorator';
import { RolesGuard } from 'src/infrastructure/middlewares/guards/roles.guard';
import { CreateCommunityDto } from '../dto/community/create-community.dto';
import { CommunityService } from '../services/community.service';

@Controller('community')
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
  ) {}

  @Get()
  public async getAll(
    @Query() { take, skip }: PagingData,
  ): Promise<CommunitiesLookUpDto[]> {
    return this.communityService.getAllCommunities(take, skip);
  }

  @Get('/:communityId')
  public async getCommunity(
    @Param('communityId') communityId: number,
  ): Promise<CommunitiesLookUpDto> {
    return this.communityService.getCommunity(communityId);
  }

  @Post('create')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  public async create(
    @Body() createCommunityDto: CreateCommunityDto,
  ): Promise<void> {
    return this.communityService.createCommunity(createCommunityDto);
  }
}
