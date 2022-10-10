import { BadRequestException } from '@nestjs/common';
import { ErrorMessages } from '../../config/const/error-messages.const';

export const imageFileFormatFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(png|jpeg|jpg)$/)) {
    return callback(
      new BadRequestException(ErrorMessages.INVALID_FILE_FORMAT),
      false,
    );
  }
  return callback(null, true);
};
