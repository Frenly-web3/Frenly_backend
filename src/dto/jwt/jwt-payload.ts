import { UserRole } from '../../infrastructure/config/enums/users-role.enum';

export class JwtPayload {
  walletAddress: string;

  role: UserRole;

  jti?: string;
}
