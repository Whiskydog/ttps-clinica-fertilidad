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

// Hardcoded mapping ONLY for quick local tests.
// Add your UUID → numeric id here temporarily.
const DOCTOR_MAP: Record<string, number> = {
  '11111111-1111-1111-1111-111111111111': 123,
};

function toExternalDoctorId(id: string): number {
  const asNumber = Number(id);
  if (Number.isFinite(asNumber)) return asNumber;
  const mapped = DOCTOR_MAP[id];
  if (Number.isFinite(mapped)) return mapped;
  throw new BadRequestException(
    'Proporcione un id numérico o agregue un mapeo en DOCTOR_MAP (archivo appointments.controller.ts)',
  );
}

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
      .reserveAppointment(Number(dto.id_paciente), Number(dto.id_turno))
      .pipe(
        switchMap((reserva) =>
          from(
            this.medicalHistory.createForPatient(String(dto.id_paciente)),
          ).pipe(map((hc) => ({ reserva, medical_history: hc }))),
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
    return this.appointments.getDoctorAppointments(toExternalDoctorId(id));
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
    return this.appointments.getDoctorAppointmentsByDate(
      toExternalDoctorId(id),
      fecha,
    );
  }
}
