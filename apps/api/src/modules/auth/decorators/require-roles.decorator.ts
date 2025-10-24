import { SetMetadata } from '@nestjs/common';
import { RoleCode } from '@repo/contracts';

export const RequireRoles = (...roles: RoleCode[]) => SetMetadata('roles', roles);
