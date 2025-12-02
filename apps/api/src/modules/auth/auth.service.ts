import { User } from '@modules/users/entities/user.entity';
import { PatientsService } from '@modules/users/services/patients.service';
import { UsersService } from '@modules/users/services/users.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthPayload, AuthToken, RoleCode } from '@repo/contracts';
import argon2 from 'argon2';
import { Response } from 'express';

// Constantes de configuración para bloqueo de login
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;
const RESET_ATTEMPTS_AFTER_MINUTES = 30;

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

    if (!user || user.role.code === RoleCode.PATIENT) {
      return null;
    }

    // Verificar si la cuenta está bloqueada
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new ForbiddenException(
        `Cuenta bloqueada. Intente nuevamente en ${remainingMinutes} minutos.`,
      );
    }

    // Resetear intentos si pasó suficiente tiempo desde el último fallo
    if (user.lastFailedLogin) {
      const timeSinceLastFailed =
        Date.now() - user.lastFailedLogin.getTime();
      if (timeSinceLastFailed > RESET_ATTEMPTS_AFTER_MINUTES * 60000) {
        await this.usersService.resetLoginAttempts(user.id);
        user.failedLoginAttempts = 0;
      }
    }

    // Validar password
    if (await argon2.verify(user.passwordHash, password)) {
      // Login exitoso - resetear intentos
      if (user.failedLoginAttempts > 0) {
        await this.usersService.resetLoginAttempts(user.id);
      }
      return user;
    }

    // Login fallido - incrementar intentos
    const newAttempts = user.failedLoginAttempts + 1;
    const lockUntil =
      newAttempts >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60000)
        : null;

    await this.usersService.recordFailedLogin(user.id, newAttempts, lockUntil);

    return null;
  }

  async validatePatient(dni: string, password: string): Promise<User | null> {
    const user = await this.patientsService.findOneByDni(dni);

    if (!user) {
      return null;
    }

    // Verificar si la cuenta está bloqueada
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new ForbiddenException(
        `Cuenta bloqueada. Intente nuevamente en ${remainingMinutes} minutos.`,
      );
    }

    // Resetear intentos si pasó suficiente tiempo desde el último fallo
    if (user.lastFailedLogin) {
      const timeSinceLastFailed =
        Date.now() - user.lastFailedLogin.getTime();
      if (timeSinceLastFailed > RESET_ATTEMPTS_AFTER_MINUTES * 60000) {
        await this.usersService.resetLoginAttempts(user.id);
        user.failedLoginAttempts = 0;
      }
    }

    // Validar password
    if (await argon2.verify(user.passwordHash, password)) {
      // Login exitoso - resetear intentos
      if (user.failedLoginAttempts > 0) {
        await this.usersService.resetLoginAttempts(user.id);
      }
      return user;
    }

    // Login fallido - incrementar intentos
    const newAttempts = user.failedLoginAttempts + 1;
    const lockUntil =
      newAttempts >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60000)
        : null;

    await this.usersService.recordFailedLogin(user.id, newAttempts, lockUntil);

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
