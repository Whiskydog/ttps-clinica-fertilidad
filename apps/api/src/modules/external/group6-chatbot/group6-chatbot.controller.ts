import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Group6ChatbotService } from './group6-chatbot.service';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/guards/role-auth.guard';
import { RequireRoles } from '@auth/decorators/require-roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { User } from '@users/entities/user.entity';
import { RoleCode } from '@repo/contracts';
@Controller('external/group6')
@UseGuards(JwtAuthGuard, RolesGuard)
export class Group6ChatbotController {
  constructor(private readonly service: Group6ChatbotService) { }

  @Post('preguntar')
  @RequireRoles(RoleCode.PATIENT)
  preguntar(@CurrentUser() user: User, @Body() body: { messages: any[] }) {
    return this.service.preguntar(user.id, body.messages);
  }
}
