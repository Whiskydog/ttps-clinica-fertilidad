import { BookAppointmentDto, PostTurnosDto } from '@modules/appointments/dto';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { Patient } from '@modules/users/entities/patient.entity';
import { User } from '@modules/users/entities/user.entity';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseDatePipe,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoleCode } from '@repo/contracts';
import moment from 'moment';
import { AppointmentsService } from './appointments.service';
import { EnvelopeMessage } from '@common/decorators/envelope-message.decorator';

@Controller('appointments')
export class AppointmentsController {
  private readonly logger = new Logger(AppointmentsController.name);

  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @EnvelopeMessage('Turno reservado con éxito.')
  async bookAppointment(
    @Body() dto: BookAppointmentDto,
    @CurrentUser() user: User,
  ) {
    if (user.role.code !== RoleCode.PATIENT) {
      this.logger.warn(
        `User with id=${user.id} and role=${user.role} attempted to book an appointment.`,
      );
      throw new BadRequestException('Solo pacientes pueden reservar turnos.');
    }

    await this.appointmentsService.bookAppointment(user as Patient, dto);
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
  getAvailableDoctorSlots(
    @Param('id', ParseIntPipe) id: number,
    @Query('date', new ParseDatePipe({ optional: true })) date?: Date,
  ) {
    if (date) {
      this.logger.log(
        `Fetching available doctor slots for doctorId=${id} on date=${moment.utc(date).format('YYYY-MM-DD')}`,
      );
      return this.appointmentsService.getDoctorAvailableSlotsByDate(
        id,
        moment.utc(date).format('YYYY-MM-DD'),
      );
    }
    this.logger.log(`Fetching all available slots for doctorId=${id}`);
    return this.appointmentsService.getDoctorAvailableSlots(id);
  }

  // Listar turnos de un médico
  @Get('doctor/:id')
  getDoctorAppointments(
    @Param('id', ParseIntPipe) id: number,
    @Query('date', new ParseDatePipe({ optional: true })) date?: Date,
  ) {
    if (date) {
      this.logger.log(
        `Fetching doctor appointments for doctorId=${id} on date=${moment.utc(date).format('YYYY-MM-DD')}`,
      );
      return this.appointmentsService.getDoctorAppointmentsByDate(
        id,
        moment.utc(date).format('YYYY-MM-DD'),
      );
    }
    this.logger.log(`Fetching all appointments for doctorId=${id}`);
    return this.appointmentsService.getDoctorAppointments(id);
  }
}
