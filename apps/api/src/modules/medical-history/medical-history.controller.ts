import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MedicalHistoryService } from './medical-history.service';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { User } from '@modules/users/entities/user.entity';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@Controller('medical-history')
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: User) {
    return this.medicalHistoryService.createForPatient(user.id);
  }
}
