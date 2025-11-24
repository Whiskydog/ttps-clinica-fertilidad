import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '@common/interfaces/auth-request.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request: AuthRequest = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
