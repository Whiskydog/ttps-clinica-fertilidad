import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class Group5PaymentsService {
  private readonly baseUrl =
    'https://ueozxvwsckonkqypfasa.supabase.co/functions/v1';

  constructor(private readonly http: HttpService) {}

  // GET obras sociales
  getObrasSociales() {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/getObrasSociales`),
    ).then((r) => r.data);
  }

  // POST deuda paciente
  deudaPaciente(id_paciente: number, numero_grupo: number) {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}/deuda paciente`, {
        id_paciente,
        numero_grupo,
      }),
    ).then((r) => r.data);
  }

  // POST deuda obra social
  deudaObra(id_obra: number, numero_grupo: number) {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}/deuda obra social`, {
        id_obra,
        numero_grupo,
      }),
    ).then((r) => r.data);
  }

  // POST total cobrado obra social
  totalCobradoObra(id_obra: number, numero_grupo: number) {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}/total cobrado obra`, {
        id_obra,
        numero_grupo,
      }),
    ).then((r) => r.data);
  }

  // POST total cobrado paciente
  totalCobradoPaciente(id_paciente: number, numero_grupo: number) {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}/total cobrado paciente`, {
        id_paciente,
        numero_grupo,
      }),
    ).then((r) => r.data);
  }

  // POST registrar orden de pago
  registrarOrdenPago(payload: {
    grupo: number;
    id_paciente: number;
    monto: number;
    id_obra: number;
  }) {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}/registrar orden pago`, payload),
    ).then((r) => r.data);
  }

  // POST registrar pago
  registrarPago(payload: {
    id_grupo: number;
    id_pago: number;
    obra_social_pagada: boolean;
    paciente_pagado: boolean;
  }) {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}/registrar pago obra social`, payload),
    ).then((r) => r.data);
  }
}
