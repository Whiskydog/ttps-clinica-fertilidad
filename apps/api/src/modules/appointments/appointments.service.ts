import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
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
    const token = this.config.get<string>('TURNOS_API_TOKEN');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const body = {
      id_paciente: 1,
      id_turno: idSlot,
    };
    return this.httpService
      .patch(url, body, { headers })
      .pipe(map((resp) => resp.data as unknown));
  }

  getPatientAppointments(idPatient: number): Observable<unknown> {
    const url = `${this.apiUrl}/get_turnos_paciente?id_paciente=${idPatient}`;
    const token = this.config.get<string>('TURNOS_API_TOKEN');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.httpService
      .get(url, { headers })
      .pipe(map((resp) => resp.data as unknown));
  }

  createDoctorSlots(body: any): Observable<unknown> {
    const url = `${this.apiUrl}/post_turnos`;
    const token = this.config.get<string>('TURNOS_API_TOKEN');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    return this.httpService
      .post(url, body, { headers })
      .pipe(map((resp) => resp.data as unknown));
  }

  getDoctorAppointments(idDoctor: number): Observable<unknown> {
    const url = `${this.apiUrl}/get_turnos_medico?id_medico=${idDoctor}`;
    const token = this.config.get<string>('TURNOS_API_TOKEN');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.httpService
      .get(url, { headers })
      .pipe(map((resp) => resp.data as unknown));
  }

  getDoctorAppointmentsByDate(
    idDoctor: number,
    date: string,
  ): Observable<unknown> {
    const url = `${this.apiUrl}/get_medico_fecha?id_medico=${idDoctor}&fecha=${encodeURIComponent(
      date,
    )}`;
    const token = this.config.get<string>('TURNOS_API_TOKEN');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.httpService
      .get(url, { headers })
      .pipe(map((resp) => resp.data as unknown));
  }
}
