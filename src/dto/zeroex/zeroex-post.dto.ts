import { PostTypeEnum } from '../../infrastructure/config/enums/post-type.enum';

export class ZeroExPostDto {
  image: string;

  walletAddress: string;

  price: number;

  collectionName: string;

  signedObject: string;

  type: PostTypeEnum;
}
