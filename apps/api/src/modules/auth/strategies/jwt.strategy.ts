import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthPayload } from '@repo/contracts';
import { UsersService } from '@users/services/users.service';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => {
          if (req.cookies) {
            return req.cookies['session'] as string;
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: AuthPayload) {
    const user = await this.usersService.findOneById(Number(payload.sub));

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    } else if (!user.isActive) {
      throw new ForbiddenException('Usuario inhabilitado');
    }

    return user;
  }
}
