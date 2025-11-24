import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs/operators';
import { ENVELOPE_MESSAGE } from '@common/decorators/envelope-message.decorator';

function defaultMessageForStatus(status: number | undefined) {
  if (!status) return 'OK';
  if (status === 201) return 'Creado con éxito';
  if (status >= 200 && status < 300) return 'OK';
  return 'Operación realizada';
}

@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(ctx: ExecutionContext, next: CallHandler) {
    const res = ctx.switchToHttp().getResponse();
    const handler = ctx.getHandler();
    const controller = ctx.getClass();

    const message = this.reflector.getAllAndOverride<string>(ENVELOPE_MESSAGE, [
      handler,
      controller,
    ]);

    return next.handle().pipe(
      map((data) => {
        const statusCode: number = res?.statusCode ?? 200;
        return {
          statusCode,
          message: message ?? defaultMessageForStatus(statusCode),
          data,
        };
      }),
    );
  }
}
