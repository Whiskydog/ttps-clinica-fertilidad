import { EnvelopeMessage } from '@common/decorators/envelope-message.decorator';
import {
  AppointmentResponseDto,
  AppointmentsResponseDto,
  BookAppointmentDto,
  PostTurnosDto,
} from '@modules/appointments/dto';
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
import { AppointmentDetail, RoleCode } from '@repo/contracts';
import moment from 'moment';
import { ZodSerializerDto } from 'nestjs-zod';
import { Appointment } from './appointment.entity';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  private readonly logger = new Logger(AppointmentsController.name);

  constructor(private readonly appointmentsService: AppointmentsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @EnvelopeMessage('Turno reservado con éxito')
  @ZodSerializerDto(AppointmentResponseDto)
  async bookAppointment(
    @Body() dto: BookAppointmentDto,
    @CurrentUser() user: User,
  ): Promise<Appointment> {
    if (user.role.code !== RoleCode.PATIENT) {
      this.logger.warn(
        `User with id=${user.id} and role=${user.role} attempted to book an appointment.`,
      );
      throw new BadRequestException('Solo pacientes pueden reservar turnos.');
    }

    const appointment = await this.appointmentsService.bookAppointment(
      user as Patient,
      dto,
    );

    return appointment;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ZodSerializerDto(AppointmentsResponseDto)
  getMyAppointments(@CurrentUser() user: User): Promise<Appointment[]> {
    return this.appointmentsService.getPatientAppointments(user.id);
  }

  @Get('available')
  @UseGuards(JwtAuthGuard)
  getAvailableAppointments(): Promise<AppointmentDetail[]> {
    return this.appointmentsService.getAvailableSlots();
  }

  @Post('doctor/slots')
  createDoctorSlots(@Body() dto: PostTurnosDto) {
    return this.appointmentsService.createDoctorSlots(dto);
  }

  @Get('doctor/:id/available')
  getAvailableDoctorSlots(
    @Param('id', ParseIntPipe) id: number,
    @Query('date', new ParseDatePipe({ optional: true })) date?: Date,
  ): Promise<AppointmentDetail[]> {
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
  ): Promise<AppointmentDetail[]> {
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
    return this.appointmentsService.getDoctorExternalAppointments(id);
  }
}
