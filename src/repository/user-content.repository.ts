import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { UserRepository } from './user.repository';
import { TokenTransfersContentRepository } from './token-transfer-content.repository';

import { UserContentEntity } from '../data/entity/user-content.entity';

import { UserContentType } from '../infrastructure/config/enums/user-content-type.enum';

import { TokenTransferContentDto } from '../dto/token-transfers/token-transfer-content.dto';
import { TokenContentStatusEnum } from '../infrastructure/config/enums/token-content-status.enum';

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

  public async getTokenTransferContentById(tokenTransferId: number): Promise<UserContentEntity> {
    return this.repository.findOne({
      where: {
        childEntityId: tokenTransferId,
      },
    });
  }

  public async getUnpublishedContent(userId: number): Promise<UserContentEntity[]> {
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

    content = await this.loadTokenTransfers(content, TokenContentStatusEnum.UNPUBLISHED);

    return content;
  }

  public async getUnpublishedContentById(id: number): Promise<UserContentEntity> {
    let content = await this.repository.find({
      where: {
        id,
      },

      relations: ['owner'],
    });

    content = await this.loadTokenTransfers(content, TokenContentStatusEnum.UNPUBLISHED);

    return content[0];
  }

  public async getPublishedContentById(id: number): Promise<UserContentEntity> {
    let content = await this.repository.find({
      where: {
        id,
      },

      relations: ['owner'],
    });

    content = await this.loadTokenTransfers(content, TokenContentStatusEnum.PUBLISHED);

    return content[0];
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

  private async loadTokenTransfers(contents: UserContentEntity[], status: TokenContentStatusEnum): Promise<UserContentEntity[]> {
    const result: UserContentEntity[] = [];

    const transferContentIds = contents
      .filter((x) => x.childEntityType === UserContentType.TOKEN_TRANSFER)
      .map((x) => x.childEntityId);

    const tokenTransfers = await this.tokenTransferRepository.getWithIds(transferContentIds);

    for (const content of contents) {
      if (content.childEntityType === UserContentType.TOKEN_TRANSFER) {
        const transfer = tokenTransfers.find(
          (x) => x.id === content.childEntityId
          && x.status === status
          && !x.isRemoved,
        );

        if (transfer != null) {
          content.userContent = transfer;

          result.push(content);
        }
      }
    }

    return result;
  }
}
