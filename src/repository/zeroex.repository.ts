import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { ZeroExEntity } from '../data/entity/zeroex.entity';

import { ZeroExPostDto } from '../dto/zeroex/zeroex-post.dto';

export class ZeroExRepository {
  private readonly repository: Repository<ZeroExEntity>;

  constructor(
    @InjectDataSource()
    private readonly connection: DataSource,
  ) {
    this.repository = connection.getRepository(ZeroExEntity);
  }

  public async create(data: ZeroExPostDto): Promise<ZeroExEntity> {
    const entity = this.repository.create({ ...data });
    return this.repository.save(entity);
  }
}
