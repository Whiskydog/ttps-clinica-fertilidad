import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class Group5PaymentsService {
  private readonly baseUrl =
    'https://ueozxvwsckonkqypfasa.supabase.co/functions/v1';

  constructor(private readonly http: HttpService) { }

  // GET obras sociales
  getObrasSociales() {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/getObrasSociales`),
    ).then((r) => r.data);
  }

  // GET obra social specific
  getObraSocial(id: number) {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/get-obra-social`, {
        data: { id }, // Body in GET request as per docs example, though unusual. trying params if fails. Docs say 'Ejemplo de solicitud' with json body.
        // attempting axios config with data for GET or params. 
        // Docs show "Ejemplo de solicitud" with JSON body { "id": 10 }. 
        // Standard GET shouldn't have body. Assuming axios supports it or it's actually POST disguised? 
        // Docs say Method: GET. sending as params as fallback if this is standard REST, but following docs strictly first implies body.
        // Actually, let's use params for GET to be safe with standard http, but if docs imply body...
        // Let's try passing as query params which is standard for GET. 
        params: { id }
      }),
    ).then((r) => r.data);
  }

  // POST deuda paciente
  deudaPaciente(id_paciente: number, numero_grupo: number) {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}/deuda-paciente`, {
        id_paciente,
        numero_grupo,
      }),
    ).then((r) => r.data);
  }

  // POST deuda obra social
  deudaObra(id_obra: number, numero_grupo: number) {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}/deuda-obra-social`, {
        id_obra,
        numero_grupo,
      }),
    ).then((r) => r.data);
  }

  // POST total cobrado obra social
  totalCobradoObra(id_obra: number, numero_grupo: number) {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}/total-cobrado-obra`, {
        id_obra,
        numero_grupo,
      }),
    ).then((r) => r.data);
  }

  // POST total cobrado paciente
  totalCobradoPaciente(id_paciente: number, numero_grupo: number) {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}/total-cobrado-paciente`, {
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
      this.http.post(`${this.baseUrl}/registrar-orden-pago`, payload),
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
      this.http.post(`${this.baseUrl}/registrar-pago-obra-social`, payload),
    ).then((r) => r.data);
  }

  // GET pago grupo (POST per docs)
  getPagoGrupo(group: number, pago_id: number) {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}/get-pago-grupo`, {
        group,
        pago_id
      }),
    ).then((r) => r.data);
  }

  // GET pagos grupo (POST per docs)
  getPagosGrupo(group: number) {
    return firstValueFrom(
      this.http.post(`${this.baseUrl}/get-pagos-grupo`, {
        group,
      }),
    ).then((r) => r.data);
  }
}
