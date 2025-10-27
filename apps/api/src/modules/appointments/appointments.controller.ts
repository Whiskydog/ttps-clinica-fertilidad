import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AppointmentsService } from './appointments.service';
import { MedicalHistoryService } from '@modules/medical-history/medical-history.service';
import {
  ConfirmAppointmentDto,
  PostTurnosDto,
} from '@modules/appointments/dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { User } from '@modules/users/entities/user.entity';
import { ReservaResponseSchema } from '@repo/contracts';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointments: AppointmentsService,
    private readonly medicalHistory: MedicalHistoryService,
  ) {}

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async confirmAndCreateMedicalHistory(
    @Body() dto: ConfirmAppointmentDto,
    @CurrentUser() user: User,
  ) {
    const reserva = await firstValueFrom(
      this.appointments.reserveAppointment(user.id, dto.id_turno),
    );

    const medical_history = await this.medicalHistory.createForPatient(user.id);

    const result = { reserva, medical_history };

    return ReservaResponseSchema.parse(result);
  }

  // Obtener turnos del paciente autenticado
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyAppointments(@CurrentUser() user: User) {
    return this.appointments.getPatientAppointments(user.id);
  }

  // Crear grilla de turnos para un médico
  @Post('doctor/slots')
  createDoctorSlots(@Body() dto: PostTurnosDto) {
    return this.appointments.createDoctorSlots(dto);
  }

  // Listar turnos de un médico
  @Get('doctor/:id/turnos')
  getDoctorAppointments(@Param('id') id: string) {
    const doctorId = Number(id);
    if (!Number.isFinite(doctorId)) {
      throw new BadRequestException('id de médico inválido, debe ser numérico');
    }
    return this.appointments.getDoctorAppointments(doctorId);
  }

  // Listar turnos de un médico por fecha YYYY-MM-DD
  @Get('doctor/:id/fecha')
  getDoctorAppointmentsByDate(
    @Param('id') id: string,
    @Query('fecha') fecha: string,
  ) {
    const doctorId = Number(id);
    if (!Number.isFinite(doctorId)) {
      throw new BadRequestException('id de médico inválido, debe ser numérico');
    }
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      throw new BadRequestException(
        'fecha inválida, formato esperado YYYY-MM-DD',
      );
    }
    return this.appointments.getDoctorAppointmentsByDate(doctorId, fecha);
  }
}
