import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppointmentDetail, TurnoRaw } from '@repo/contracts';
import { firstValueFrom, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { mapRawAppointments } from './dto';

@Injectable()
export class AppointmentsService {
  private readonly apiUrl: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.apiUrl = this.config.getOrThrow<string>('API_URL_TURNOS');
  }

  reserveAppointment(idPatient: number, idSlot: number): Observable<unknown> {
    const url = `${this.apiUrl}/reservar_turno`;
    const headers = this.buildAuthHeaders(true);
    const body = {
      id_paciente: idPatient,
      id_turno: idSlot,
    };
    return this.httpService.patch(url, body, { headers }).pipe(
      map((resp) => resp.data as unknown),
      catchError((err) => this.handleAxiosError(err)),
    );
  }

  getPatientAppointments(idPatient: number): Observable<unknown> {
    const url = `${this.apiUrl}/get_turnos_paciente?id_paciente=${idPatient}`;
    const headers = this.buildAuthHeaders();
    return this.httpService.get(url, { headers }).pipe(
      map((resp) => resp.data as unknown),
      catchError((err) => this.handleAxiosError(err)),
    );
  }

  createDoctorSlots(body: any): Observable<unknown> {
    const url = `${this.apiUrl}/post_turnos`;
    const headers = this.buildAuthHeaders(true);
    return this.httpService.post(url, body, { headers }).pipe(
      map((resp) => resp.data as unknown),
      catchError((err) => this.handleAxiosError(err)),
    );
  }

  async getDoctorAvailableSlots(doctorId: number) {
    const appointmentsAndSlots =
      await this.getDoctorAppointmentsAndSlots(doctorId);
    return appointmentsAndSlots.filter(
      (appointment) => appointment.patientId === null,
    );
  }

  async getDoctorAvailableSlotsByDate(doctorId: number, date: string) {
    const appointmentsAndSlots = await this.getDoctorAppointmentsAndSlotsByDate(
      doctorId,
      date,
    );
    return appointmentsAndSlots.filter(
      (appointment) => appointment.patientId === null,
    );
  }

  async getDoctorAppointments(doctorId: number): Promise<AppointmentDetail[]> {
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

  private async getDoctorAppointmentsAndSlots(doctorId: number) {
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
    const token = this.config.get<string>('TURNOS_API_TOKEN');
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
