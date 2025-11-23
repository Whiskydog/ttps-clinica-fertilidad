import {
  ConfirmAppointmentDto,
  PostTurnosDto,
} from '@modules/appointments/dto';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { MedicalHistoryService } from '@modules/medical-history/services/medical-history.service';
import { User } from '@modules/users/entities/user.entity';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseDatePipe,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReservaResponseSchema } from '@repo/contracts';
import moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  private readonly logger = new Logger(AppointmentsController.name);

  constructor(
    private readonly appointmentsService: AppointmentsService,
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
      this.appointmentsService.reserveAppointment(user.id, dto.id_turno),
    );

    const medical_history = await this.medicalHistory.createForPatient(user.id);

    const result = { reserva, medical_history };

    return ReservaResponseSchema.parse(result);
  }

  // Obtener turnos del paciente autenticado
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyAppointments(@CurrentUser() user: User) {
    return this.appointmentsService.getPatientAppointments(user.id);
  }

  // Crear grilla de turnos para un médico
  @Post('doctor/slots')
  createDoctorSlots(@Body() dto: PostTurnosDto) {
    return this.appointmentsService.createDoctorSlots(dto);
  }

  // Listar turnos disponibles de un médico
  @Get('doctor/:id/available')
  getAvailableDoctorSlots(@Param('id', ParseIntPipe) id: number, @Query('date', new ParseDatePipe()) date?: Date) {
    if (date) {
      this.logger.log(`Fetching available doctor slots for doctorId=${id} on date=${moment.utc(date).format('YYYY-MM-DD')}`);
      return this.appointmentsService.getDoctorAvailableSlotsByDate(id, moment.utc(date).format('YYYY-MM-DD'));
    }
    this.logger.log(`Fetching all available slots for doctorId=${id}`);
    return this.appointmentsService.getDoctorAvailableSlots(id);
  }

  // Listar turnos de un médico
  @Get('doctor/:id')
  getDoctorAppointments(@Param('id', ParseIntPipe) id: number, @Query('date', new ParseDatePipe()) date?: Date) {
    if (date) {
      this.logger.log(`Fetching doctor appointments for doctorId=${id} on date=${moment.utc(date).format('YYYY-MM-DD')}`);
      return this.appointmentsService.getDoctorAppointmentsByDate(id, moment.utc(date).format('YYYY-MM-DD'));
    }
    this.logger.log(`Fetching all appointments for doctorId=${id}`);
    return this.appointmentsService.getDoctorAppointments(id);
  }
}
