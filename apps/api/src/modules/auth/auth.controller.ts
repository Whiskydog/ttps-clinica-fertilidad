import { Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { UserParam } from "@modules/users/decorators/user.decorator";
import { User } from "@modules/users/entities/user.entity";
import { AuthService } from "./auth.service";
import type { Response } from "express";
import { Public } from "./decorators/public.decorator";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@UserParam() user: User, @Res({ passthrough: true }) response: Response) {
    const signInResult = await this.authService.signIn(user);

    if ('accessToken' in signInResult) {
      this.authService.setCookie(response, signInResult.accessToken);
    }

    return signInResult;
  }
}