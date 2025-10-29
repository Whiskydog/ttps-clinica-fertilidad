import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Controller, Get } from '@nestjs/common';
import { UserResponseDto } from '@users/dto';
import { User } from '@users/entities/user.entity';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller()
export class UsersController {
  @Get('/me')
  @ZodSerializerDto(UserResponseDto)
  getProfile(@CurrentUser() user: User) {
    return user;
  }
}
