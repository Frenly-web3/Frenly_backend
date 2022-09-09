import { Injectable } from '@nestjs/common';

import * as httpContext from 'express-http-context';
import { JwtPayload } from '../dto/jwt/jwt-payload';

@Injectable()
export class CurrentUserService {
  getCurrentUserInfo(): JwtPayload {
    const payload = httpContext.get('token');
    return payload;
  }
}
