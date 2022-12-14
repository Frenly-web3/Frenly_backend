import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MulterField } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

import { diskStorage } from 'multer';
import { extname } from 'path';
import * as uuid from 'uuid';

import { ImageFileFolder } from '../../config/enums/image-file-folder.enum';

import { imageFileFormatFilter } from '../filters/image-file-format.filter';

const editFileName = (req, file, callback) => {
  const fileExtName = extname(file.originalname);

  const guid = uuid.v4();
  const currentDate = new Date().toISOString();

  callback(null, `${guid}-${currentDate}${fileExtName}`);
};

const avatarsFilePath = 'avatars';
const zeroExSellFilePath = 'zeroex/sell';
const communityImageFilePath = 'community-content/images';

export const ImageFilesInterceptor = (fieldName: MulterField[], dest: ImageFileFolder) => {
  let destination = './public/';

  switch (dest) {
    case ImageFileFolder.AVATAR:
      destination = destination.concat(avatarsFilePath);
      break;

    case ImageFileFolder.ZEROEX_SELL:
      destination = destination.concat(zeroExSellFilePath);
      break;

    case ImageFileFolder.COMMUNITY_IMAGE:
      destination = destination.concat(communityImageFilePath);
      break;

    default:
      destination = destination.concat('files');
      break;
  }

  return FileFieldsInterceptor(fieldName, {
    storage: diskStorage({
      destination,
      filename: editFileName,
    }),
    fileFilter: imageFileFormatFilter,
  });
};
