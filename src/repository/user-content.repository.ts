import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { UserRepository } from './user.repository';
import { TokenTransfersContentRepository } from './token-transfer-content.repository';

import { UserContentEntity } from '../data/entity/user-content.entity';

import { UserContentType } from '../infrastructure/config/enums/user-content-type.enum';

import { TokenTransferContentDto } from '../dto/token-transfers/token-transfer-content.dto';

export class UserContentRepository {
  private readonly repository: Repository<UserContentEntity>;

  constructor(
    @InjectDataSource()
    private readonly connection: DataSource,

    private readonly userRepository: UserRepository,

    private readonly tokenTransferRepository: TokenTransfersContentRepository,
  ) {
    this.repository = connection.getRepository(UserContentEntity);
  }

  public async getContentByUserId(userId: number): Promise<UserContentEntity[]> {
    let content = await this.repository.find({
      where: {
        owner: {
          id: userId,
        },
      },

      order: {
        creationDate: 'DESC',
      },

      relations: ['owner'],
    });

    content = await this.loadTokenTransfers(content);

    return content;
  }

  public async getContentByUserManyIds(userIds: number[]): Promise<UserContentEntity[]> {
    let content = await this.repository.find({
      where: {
        owner: {
          id: In(userIds),
        },
      },

      order: {
        creationDate: 'DESC',
      },

      relations: ['owner'],
    });

    content = await this.loadTokenTransfers(content);

    return content;
  }

  public async createTokenTransferContent(
    userId: number,
    contentData: TokenTransferContentDto,

    creationDate: Date = new Date(),
    updateDate: Date = new Date(),
  ) {
    const user = await this.userRepository.getOneById(userId);
    const { id } = await this.tokenTransferRepository.create(contentData);

    const contentEntity = this.repository.create({
      owner: user,
      childEntityId: id,
      childEntityType: UserContentType.TOKEN_TRANSFER,

      creationDate,
      updateDate,
    });

    await this.repository.save(contentEntity);
  }

  private async loadTokenTransfers(contents: UserContentEntity[]): Promise<UserContentEntity[]> {
    const transferContentIds = contents
      .filter((x) => x.childEntityType === UserContentType.TOKEN_TRANSFER)
      .map((x) => x.childEntityId);

    const tokenTransfers = await this.tokenTransferRepository.getWithIds(transferContentIds);

    for (const content of contents) {
      if (content.childEntityType === UserContentType.TOKEN_TRANSFER) {
        const transfer = tokenTransfers.find((x) => x.id === content.childEntityId);

        content.userContent = transfer;
      }
    }

    return contents;
  }
}
