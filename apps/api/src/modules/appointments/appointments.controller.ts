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
} from '@nestjs/common';
import { from, map, switchMap } from 'rxjs';
import { AppointmentsService } from './appointments.service';
import { MedicalHistoryService } from '@modules/medical-history/medical-history.service';
import {
  ConfirmAppointmentDto,
  PostTurnosDto,
} from '@modules/appointments/dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointments: AppointmentsService,
    private readonly medicalHistory: MedicalHistoryService,
  ) {}

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  confirmAndCreateHC(@Body() dto: ConfirmAppointmentDto) {
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

  // Obtener turnos de un paciente en el modulo externo
  @Get('patient/:id')
  getPatientAppointments(@Param('id') id: string) {
    const patientId = Number(id);
    if (!Number.isFinite(patientId)) {
      throw new BadRequestException(
        'id de paciente inválido, debe ser numérico',
      );
    }
    return this.appointments.getPatientAppointments(patientId);
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
