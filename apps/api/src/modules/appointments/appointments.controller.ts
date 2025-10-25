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
} from '@nestjs/common';
import { from, map, of, switchMap } from 'rxjs';
import { AppointmentsService } from './appointments.service';
import { ConfirmAppointmentDto } from './dto/confirm-appointment.dto';
import { MedicalHistoryService } from '@modules/medical-history/medical-history.service';

import { ConfigService } from '@nestjs/config';
import { PostTurnosDto } from './dto/post-turnos.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointments: AppointmentsService,
    private readonly medicalHistory: MedicalHistoryService,
    private readonly config: ConfigService,
  ) {}

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  confirmAndCreateHC(@Body() dto: ConfirmAppointmentDto) {
    return this.appointments
      .reservarTurno(dto.id_paciente, dto.id_turno)
      .pipe(
        switchMap((reserva) =>
          from(this.medicalHistory.findByPatientId(dto.id_paciente)).pipe(
            switchMap((hcExisting) =>
              hcExisting
                ? of({ reserva, medical_history: hcExisting })
                : from(
                    this.medicalHistory.createForPatient(dto.id_paciente),
                  ).pipe(map((hc) => ({ reserva, medical_history: hc }))),
            ),
          ),
        ),
      );
  }

  // DEV-only: generar grilla de turnos para un médico (pruebas locales)
  @Post('dev/post-turnos')
  postTurnos(@Body() dto: PostTurnosDto) {
    if (this.config.get<string>('ENABLE_DEV_ENDPOINTS') !== 'true') {
      throw new ForbiddenException('Endpoint no disponible en producción');
    }
    // Validado por ZodValidationPipe
    return this.appointments.postTurnos(dto);
  }

  // DEV-only: listar turnos de un médico
  @Get('dev/medico/:id/turnos')
  getTurnosMedico(@Param('id') id: string) {
    if (this.config.get<string>('ENABLE_DEV_ENDPOINTS') !== 'true') {
      throw new ForbiddenException('Endpoint no disponible en producción');
    }
    return this.appointments.getTurnosMedico(Number(id));
  }

  // DEV-only: listar turnos de un médico por fecha YYYY-MM-DD
  @Get('dev/medico/:id/fecha')
  getMedicoFecha(@Param('id') id: string, @Query('fecha') fecha: string) {
    if (this.config.get<string>('ENABLE_DEV_ENDPOINTS') !== 'true') {
      throw new ForbiddenException('Endpoint no disponible en producción');
    }
    return this.appointments.getMedicoFecha(Number(id), fecha);
  }
}
