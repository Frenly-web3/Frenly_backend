import { InjectDataSource } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';

import { UserRepository } from './user.repository';
import { TokenTransfersContentRepository } from './token-transfer-content.repository';

import { UserContentEntity } from '../data/entity/user-content.entity';

import { UserContentType } from '../infrastructure/config/enums/user-content-type.enum';

import { TokenTransferContentDto } from '../dto/token-transfers/token-transfer-content.dto';

export class UserContentRepository {
  private readonly repository: Repository<UserContentEntity>;

  constructor(
    @InjectDataSource()
    private readonly connection: Connection,

    private readonly userRepository: UserRepository,

    private readonly tokenTransferRepository: TokenTransfersContentRepository,
  ) {
    this.repository = connection.getRepository(UserContentEntity);
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
}
