import { MedicalHistoryService } from '@modules/medical-history/services/medical-history.service';
import { Patient } from '@modules/users/entities/patient.entity';
import { DoctorsService } from '@modules/users/services/doctors.service';
import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ConflictException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AppointmentDetail,
  ExternalBookingResponse,
  ReasonForVisit,
  TurnoRaw,
} from '@repo/contracts';
import moment from 'moment';
import { firstValueFrom, forkJoin, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BookAppointmentDto, mapRawAppointments } from './dto';
import { Appointment } from './appointment.entity';
import { Treatment } from '@modules/treatments/entities/treatment.entity';
import { Doctor } from '@modules/users/entities/doctor.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AppointmentsService {
  private readonly apiUrl: string;
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @Inject(forwardRef(() => MedicalHistoryService))
    private readonly medicalHistoryService: MedicalHistoryService,
    private readonly doctorsService: DoctorsService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.getOrThrow<string>('API_URL_TURNOS');
  }

  async createLocalAppointment(params: {
    treatment?: Treatment;
    doctor: Doctor;
    externalId: string;
    isOvertime: boolean;
    reason: ReasonForVisit;
  }): Promise<Appointment> {
    const appointment = this.appointmentRepository.create({
      treatment: params.treatment ?? null,
      doctor: params.doctor,
      externalId: params.externalId,
      isOvertime: params.isOvertime,
      reason: params.reason,
    });

    return this.appointmentRepository.save(appointment);
  }

  async bookAppointment(
    patient: Patient,
    dto: BookAppointmentDto,
  ): Promise<Appointment> {
    const patientMedicalHistory = await this.medicalHistoryService.findByUserId(
      patient.id,
    );
    if (!patientMedicalHistory) {
      if (dto.reason !== ReasonForVisit.InitialConsultation) {
        this.logger.warn(
          `Patient with id=${patient.id} attempted to book a non-initial consultation appointment without a medical history.`,
        );
        throw new BadRequestException(
          'Debe tener una historia clínica y un tratamiento actual para reservar este tipo de turno. Reserve un turno de consulta inicial primero.',
        );
      }

      this.logger.log(
        `Patient with id=${patient.id} does not have a medical history, creating...`,
      );
      await this.medicalHistoryService.createForPatient(patient.id);
      this.logger.log(
        `Medical history created for patient with id=${patient.id}`,
      );
    } else if (!patientMedicalHistory.currentTreatment) {
      if (dto.reason !== ReasonForVisit.InitialConsultation) {
        this.logger.warn(
          `Patient with id=${patient.id} attempted to book a non-initial consultation appointment without a current treatment.`,
        );
        throw new BadRequestException(
          'El paciente debe tener un tratamiento actual para reservar este tipo de turno.',
        );
      }
    }

    this.logger.log(
      `Booking appointment for patient with id=${patient.id} for appointment id=${dto.appointment.id}`,
    );

    const url = `${this.apiUrl}/reservar_turno`;
    const headers = this.buildAuthHeaders(true);
    const body = {
      id_paciente: patient.id,
      id_turno: dto.appointment.id,
    };

    const externalBookingResponse = await firstValueFrom(
      this.httpService
        .patch<ExternalBookingResponse>(url, body, { headers })
        .pipe(catchError((err) => this.handleAxiosError(err))),
    );

    const externalBooking = externalBookingResponse.data.turno;

    const appointment = this.appointmentRepository.create({
      externalId: externalBooking.id.toString(),
      date: moment.utc(externalBooking.fecha_hora).toDate(),
      doctor: { id: dto.appointment.doctorId },
      medicalHistory: {
        id: patientMedicalHistory.id,
      },
      treatment: { id: patientMedicalHistory.currentTreatment?.id },
      reason: dto.reason,
    });

    const savedAppointment = await this.appointmentRepository.save(appointment);

    return this.appointmentRepository.findOne({
      where: { id: savedAppointment.id },
      relations: ['doctor'],
    });
  }

  async getPatientAppointments(patientId: number): Promise<Appointment[]> {
    const appointments = await this.appointmentRepository.find({
      where: {
        medicalHistory: {
          patient: {
            id: patientId,
          },
        },
      },
      relations: ['doctor', 'medicalHistory', 'treatment'],
    });

    return appointments;
  }

  async createDoctorSlots(body: any) {
    const url = `${this.apiUrl}/post_turnos`;
    const headers = this.buildAuthHeaders(true);
    return await firstValueFrom(
      this.httpService.post(url, body, { headers }).pipe(
        map((resp) => resp.data as unknown),
        catchError((err) => this.handleAxiosError(err)),
      ),
    );
  }

  async getAvailableSlots(): Promise<AppointmentDetail[]> {
    const doctors = await this.doctorsService.getDoctors();
    const urls = doctors.map((doctor) => {
      return `${this.apiUrl}/get_turnos_medico?id_medico=${doctor.id}`;
    });

    const allAppointmentsObservables = urls.map((url) => {
      const headers = this.buildAuthHeaders();
      return this.httpService.get<{ data: TurnoRaw[] }>(url, { headers }).pipe(
        map((resp) => mapRawAppointments(resp.data.data)),
        catchError((err) => this.handleAxiosError(err)),
      );
    });

    const allAppointmentsArrays = await firstValueFrom(
      forkJoin(allAppointmentsObservables),
    );

    const allAppointments = allAppointmentsArrays.flat();

    return allAppointments.filter(
      (appointment) =>
        appointment.patientId === null &&
        moment.utc(appointment.dateTime).isSameOrAfter(moment.utc(), 'day'),
    );
  }

  async getDoctorAvailableSlots(
    doctorId: number,
  ): Promise<AppointmentDetail[]> {
    const appointmentsAndSlots =
      await this.getDoctorAppointmentsAndSlots(doctorId);
    return appointmentsAndSlots.filter(
      (appointment) =>
        appointment.patientId === null &&
        moment.utc(appointment.dateTime).isSameOrAfter(moment.utc(), 'day'),
    );
  }

  async getDoctorAvailableSlotsByDate(
    doctorId: number,
    date: string,
  ): Promise<AppointmentDetail[]> {
    const appointmentsAndSlots = await this.getDoctorAppointmentsAndSlotsByDate(
      doctorId,
      date,
    );
    return appointmentsAndSlots.filter(
      (appointment) => appointment.patientId === null,
    );
  }

  async getDoctorAppointments(doctorId: number): Promise<Appointment[]> {
    const appointmentsAndSlots =
      await this.appointmentRepository.find({
        where: {
          doctor: {
            id: doctorId,
          },
        },
        relations: ['doctor', 'medicalHistory', 'medicalHistory.patient', 'treatment'],
      });
    return appointmentsAndSlots;
  }
  async getDoctorExternalAppointments(doctorId: number): Promise<AppointmentDetail[]> {
    const appointmentsAndSlots =
      await this.getDoctorAppointmentsAndSlots(doctorId);
    return appointmentsAndSlots.filter(
      (appointment) => appointment.patientId !== null,
    );
  }

  async getDoctorAppointmentsByDate(
    doctorId: number,
    date: string,
  ): Promise<AppointmentDetail[]> {
    const appointmentsAndSlots = await this.getDoctorAppointmentsAndSlotsByDate(
      doctorId,
      date,
    );
    return appointmentsAndSlots.filter(
      (appointment) => appointment.patientId !== null,
    );
  }
  async reserveExternalSlotByDoctor(params: {
    patientId: number;
    externalSlotId: number;
  }): Promise<void> {
    const url = `${this.apiUrl}/reservar_turno`;
    const headers = this.buildAuthHeaders(true);

    const body = {
      id_paciente: params.patientId,
      id_turno: params.externalSlotId,
    };

    await firstValueFrom(
      this.httpService
        .patch(url, body, { headers })
        .pipe(catchError((err) => this.handleAxiosError(err))),
    );
  }

  private async getDoctorAppointmentsAndSlots(
    doctorId: number,
  ): Promise<AppointmentDetail[]> {
    const url = `${this.apiUrl}/get_turnos_medico?id_medico=${doctorId}`;
    const headers = this.buildAuthHeaders();
    const appointmentsObservable = this.httpService
      .get<{ data: TurnoRaw[] }>(url, { headers })
      .pipe(
        map((resp) => mapRawAppointments(resp.data.data)),
        catchError((err) => this.handleAxiosError(err)),
      );

    return await firstValueFrom(appointmentsObservable);
  }

  private async getDoctorAppointmentsAndSlotsByDate(
    doctorId: number,
    date: string,
  ): Promise<AppointmentDetail[]> {
    const url = `${this.apiUrl}/get_medico_fecha?id_medico=${doctorId}&fecha=${encodeURIComponent(
      date,
    )}`;
    const headers = this.buildAuthHeaders();
    const appointmentsObservable = this.httpService
      .get<{ data: TurnoRaw[] }>(url, { headers })
      .pipe(
        map((resp) => mapRawAppointments(resp.data.data)),
        catchError((err) => this.handleAxiosError(err)),
      );

    return await firstValueFrom(appointmentsObservable);
  }

  private buildAuthHeaders(json: boolean = false) {
    const token = this.configService.get<string>('TURNOS_API_TOKEN');
    if (!token) {
      throw new InternalServerErrorException('TURNOS_API_TOKEN no configurado');
    }
    const base = { Authorization: `Bearer ${token}` } as Record<string, string>;
    return json ? { ...base, 'Content-Type': 'application/json' } : base;
  }

  private handleAxiosError(error: any) {
    const status = error?.response?.status ?? 500;
    const data = error?.response?.data as any;
    const message =
      typeof data === 'string'
        ? data
        : data?.error || data?.message || 'Error en API de turnos';

    let exception: HttpException;
    switch (status) {
      case 400:
        exception = new BadRequestException(message);
        break;
      case 401:
        exception = new UnauthorizedException(message);
        break;
      case 404:
        exception = new NotFoundException(message);
        break;
      case 409:
        exception = new ConflictException(message);
        break;
      default: {
        const statusCode = typeof status === 'number' ? status : 500;
        exception = new HttpException({ message }, statusCode);
      }
    }

    // Re-emite como error de RxJS para que Nest lo serialice como HTTP
    return throwError(() => exception);
  }
}
