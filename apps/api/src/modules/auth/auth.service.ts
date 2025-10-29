import { User } from '@modules/users/entities/user.entity';
import { PatientsService } from '@modules/users/services/patients.service';
import { UsersService } from '@modules/users/services/users.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthPayload, AuthToken, RoleCode } from '@repo/contracts';
import argon2 from 'argon2';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly patientsService: PatientsService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOneByEmail(email);

    if (user) {
      if (user.role.code === RoleCode.PATIENT) {
        return null;
      }

      if (await argon2.verify(user.passwordHash, password)) {
        return user;
      }
    }

    return null;
  }

  async validatePatient(dni: string, password: string): Promise<User | null> {
    const user = await this.patientsService.findOneByDni(dni);
    if (user && (await argon2.verify(user.passwordHash, password))) {
      return user;
    }
    return null;
  }

  async signIn(user: User): Promise<AuthToken> {
    const payload: Partial<AuthPayload> = {
      sub: String(user.id),
      role: user.role.code,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  setCookie(response: Response, accessToken: string) {
    response.cookie('session', accessToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 1000 * 60 * 60 * 12, // 12 hours, like the token expiration
    });
  }

  clearCookie(response: Response) {
    response.clearCookie('session', {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }
}
