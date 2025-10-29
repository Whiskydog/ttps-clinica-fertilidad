import { EnvelopeMessage } from '@common/decorators/envelope-message.decorator';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { User } from '@modules/users/entities/user.entity';
import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LocalPatientAuthGuard } from './guards/local-patient-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    const signInResult = await this.authService.signIn(user);

    this.authService.setCookie(response, signInResult.accessToken);

    return signInResult;
  }

  @Public()
  @UseGuards(LocalPatientAuthGuard)
  @HttpCode(HttpStatus.OK)
  @EnvelopeMessage('Inicio de sesión exitoso')
  @Post('sign-in/patient')
  async signInPatient(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    const signInResult = await this.authService.signIn(user);

    this.authService.setCookie(response, signInResult.accessToken);

    return signInResult;
  }
}
