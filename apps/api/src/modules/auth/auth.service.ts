import { User } from '@modules/users/entities/user.entity';
import { UsersService } from '@modules/users/services/users.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthPayload, AuthToken } from '@repo/contracts';
import { Response } from 'express';
import argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await argon2.verify(user.passwordHash, password))) {
      return user;
    }
    return null;
  }

  async signIn(user: User): Promise<AuthToken> {
    const payload: AuthPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.code,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  setCookie(response: Response, accessToken: string) {
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 1000 * 60 * 60 * 12, // 12 hours, like the token expiration
    });
  }

  clearCookie(response: Response) {
    response.clearCookie('accessToken', {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }
}
