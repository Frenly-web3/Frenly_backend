import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { UserEntity } from 'src/data/entity/user.entity';
import { CommunitiesLookUpDto } from 'src/dto/community/communities-look-up.dto';
import { UserRole } from 'src/infrastructure/config/enums/users-role.enum';
import { CreateCommunityDto } from '../dto/community/create-community.dto';
import { CommunityDto } from '../dto/community/community.dto';
import { CommunityRepository } from '../repository/community.repository';
import { CurrentUserService } from './current-user.service';
import { UserDto } from '../dto/user/user.dto';
import { CommunityEntity } from '../data/entity/community.entity';
import { UserRepository } from '../repository/user.repository';
import { AuthenticationService } from './authentication.service';
import { BlockchainTypeEnum } from 'src/infrastructure/config/enums/blockchain-type.enum';

@Injectable()
export class CommunityService {
  // eslint-disable-next-line max-len
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthenticationService,
    private readonly currentUserService: CurrentUserService,
    private readonly communityRepository: CommunityRepository,
  ) {}

  public async getAllCommunities(take: number, skip: number): Promise<CommunitiesLookUpDto[]> {
    const allCommunitiesFromDB = await this.communityRepository.getAll(take, skip);

    return this.mapCommunitiesData(allCommunitiesFromDB);
  }

  public async getCommunity(id: number): Promise<CommunitiesLookUpDto> {
    const communityFromDB = await this.communityRepository.getOneById(id);

    if (!communityFromDB) {
      throw new NotFoundException('Community not found');
    }

    return this.mapCommunityData(communityFromDB);
  }

  public async createCommunity(
    createCommunityDto: CreateCommunityDto,
  ): Promise<void> {
    // for testing
    // const contractAddress = '0xe785E82358879F061BC3dcAC6f0444462D4b5330';
    const { contractAddress, name, network } = createCommunityDto;

    const communityFromDB = await this.communityRepository.getOneByContractAddress(contractAddress);

    if (communityFromDB) {
      throw new BadRequestException('Community with this address already exists');
    }
    const payload = this.currentUserService.getCurrentUserInfo();
    const currentUserWalletAddress = payload.walletAddress;
    // const currentUserWalletAddress = '0xe213719356a12cb5610e70660e8f82fce8199fc0';
    const currentUser = await this.userRepository.getOneByWalletAddress(currentUserWalletAddress);

    if (!currentUser || currentUser.role === UserRole.BASIC_USER) {
      throw new UnauthorizedException();
    }

    const newCommunity: CommunityDto = {
      name,
      contractAddress: contractAddress.toLowerCase(),
      creator: currentUser,
    };

    const community = await this.communityRepository.create(newCommunity);

    const communityMembers = await this.getCommunityMembersFromSC(contractAddress, network);

    if (communityMembers.length === 0) {
      return;
    }

    await this.matchAndSaveCommunityMembers(communityMembers, community);
  }

  // eslint-disable-next-line function-paren-newline
  public async getCommunityMembersFromSC(
    contractAddress: string,
    network: BlockchainTypeEnum,
  ): Promise<string[]> {
    try {
      const { data } = await axios
        .get(
        // eslint-disable-next-line max-len
          `https://${network === BlockchainTypeEnum.ETHEREUM ? 'eth' : 'polygon'}-mainnet.g.alchemy.com/nft/v2/${network === BlockchainTypeEnum.ETHEREUM ? process.env.ALCHEMY_API_KEY_ETHEREUM : process.env.ALCHEMY_API_KEY_POLYGON}/getOwnersForCollection/?contractAddress=${contractAddress}&withTokenBalances=false`, { timeout: 20000 },
          // eslint-disable-next-line max-len
        );

      if (!data.ownerAddresses) {
        throw new BadRequestException('Didn\'t get contract members');
      }

      return data.ownerAddresses;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Didn\'t get contract members');
    }
  }

  // работает только для новых сообществ. с существующими может быть проблемы из-за того, что пользователь уже может быть в сообществе. поэтому надо будет переписать
  public async matchAndSaveCommunityMembers(communityMembers: string[], community: CommunityEntity): Promise<void> {
    const newMembers: UserEntity[] = [];

    const uniqueCommunityMembers: string[] = [];

    for (const member of communityMembers) {
      if (!uniqueCommunityMembers.find((uniqueCommunityMember) => uniqueCommunityMember === member)) {
        uniqueCommunityMembers.push(member);
      }
    }
    const allUsers = await this.userRepository.getAll();
    for (const member of uniqueCommunityMembers) {
      const user = allUsers.find((userFromDB) => userFromDB.walletAddress.toLowerCase() === member.toLowerCase());

      if (user) {
        // нужна ли проверка на то, что у пользователь уже является мембером этого комьюнити или нет, зависит от того,сразу ли запускается или нет
        // community.members.push(user); //not working
        newMembers.push(user);
      } else {
        const userCreateData: UserDto = {
          walletAddress: member.toLowerCase(),
          nonce: this.authService.generateNonce(),

        };
        const newUser = await this.userRepository.create(userCreateData);
        if (!newUser) {
          throw new BadRequestException('sth went wr');
        }
        // community.members.push(newUser); //not working
        newMembers.push(newUser);
      }
    }

    community.members = [...newMembers];
    await this.communityRepository.save(community);
  }

  private mapCommunitiesData(communities: CommunityEntity[]): CommunitiesLookUpDto[] {
    const result: CommunitiesLookUpDto[] = [];

    for (const community of communities) {
      const contentWrapper = new CommunitiesLookUpDto();

      contentWrapper.id = community.id;
      contentWrapper.creator = community.creator.id;
      contentWrapper.name = community.name;
      contentWrapper.contractAddress = community.contractAddress;
      contentWrapper.membersAmount = community.members.length;

      result.push(contentWrapper);
    }

    return result;
  }

  private mapCommunityData(community: CommunityEntity): CommunitiesLookUpDto {
    const contentWrapper = new CommunitiesLookUpDto();

    contentWrapper.id = community.id;
    contentWrapper.creator = community.creator.id;
    contentWrapper.name = community.name;
    contentWrapper.contractAddress = community.contractAddress;
    contentWrapper.membersAmount = community.members.length;
    return contentWrapper;
  }
}