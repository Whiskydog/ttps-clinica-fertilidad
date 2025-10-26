import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppointmentsService {
  private readonly apiUrl =
    'https://ahlnfxipnieoihruewaj.supabase.co/functions/v1';
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

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

  getDoctorAppointments(idDoctor: number): Observable<unknown> {
    const url = `${this.apiUrl}/get_turnos_medico?id_medico=${idDoctor}`;
    const headers = this.buildAuthHeaders();
    return this.httpService.get(url, { headers }).pipe(
      map((resp) => resp.data as unknown),
      catchError((err) => this.handleAxiosError(err)),
    );
  }

  getDoctorAppointmentsByDate(
    idDoctor: number,
    date: string,
  ): Observable<unknown> {
    const url = `${this.apiUrl}/get_medico_fecha?id_medico=${idDoctor}&fecha=${encodeURIComponent(
      date,
    )}`;
    const headers = this.buildAuthHeaders();
    return this.httpService.get(url, { headers }).pipe(
      map((resp) => resp.data as unknown),
      catchError((err) => this.handleAxiosError(err)),
    );
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
