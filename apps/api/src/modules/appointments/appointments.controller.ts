import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { from, map, switchMap } from 'rxjs';
import { AppointmentsService } from './appointments.service';
import { MedicalHistoryService } from '@modules/medical-history/medical-history.service';
import { ConfigService } from '@nestjs/config';
import {
  PostTurnosDto,
  ConfirmAppointmentDto,
} from '@modules/appointments/dto';
import type { ConfirmAppointmentDtoType } from '@modules/appointments/dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointments: AppointmentsService,
    private readonly medicalHistory: MedicalHistoryService,
    private readonly config: ConfigService,
  ) {}

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  confirmAndCreateHC(
    @Body() dto: ConfirmAppointmentDto & ConfirmAppointmentDtoType,
  ) {
    return this.appointments
      .reserveAppointment(dto.id_paciente, dto.id_turno)
      .pipe(
        switchMap((reserva) =>
          from(this.medicalHistory.createForPatient(dto.id_paciente)).pipe(
            map((hc) => ({ reserva, medical_history: hc })),
          ),
        ),
      );
  }

  // DEV-only: generar grilla de turnos para un médico (pruebas locales)
  @Post('dev/post-turnos')
  createSlots(@Body() dto: PostTurnosDto) {
    if (this.config.get<string>('ENABLE_DEV_ENDPOINTS') !== 'true') {
      throw new ForbiddenException('Endpoint no disponible en producción');
    }
    // Validado por ZodValidationPipe
    return this.appointments.createDoctorSlots(dto);
  }

  // DEV-only: listar turnos de un médico
  @Get('dev/medico/:id/turnos')
  getDoctorAppointments(@Param('id') id: string) {
    if (this.config.get<string>('ENABLE_DEV_ENDPOINTS') !== 'true') {
      throw new ForbiddenException('Endpoint no disponible en producción');
    }
    const doctorId = Number(id);
    if (!Number.isFinite(doctorId)) {
      throw new BadRequestException('id de médico inválido, debe ser numérico');
    }
    return this.appointments.getDoctorAppointments(doctorId);
  }

  // DEV-only: listar turnos de un médico por fecha YYYY-MM-DD
  @Get('dev/medico/:id/fecha')
  getDoctorAppointmentsByDate(
    @Param('id') id: string,
    @Query('fecha') fecha: string,
  ) {
    if (this.config.get<string>('ENABLE_DEV_ENDPOINTS') !== 'true') {
      throw new ForbiddenException('Endpoint no disponible en producción');
    }
    const doctorId = Number(id);
    if (!Number.isFinite(doctorId)) {
      throw new BadRequestException('id de médico inválido, debe ser numérico');
    }
    return this.appointments.getDoctorAppointmentsByDate(doctorId, fecha);
  }
}
