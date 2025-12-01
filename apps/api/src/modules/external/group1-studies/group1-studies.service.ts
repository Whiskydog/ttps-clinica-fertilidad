import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';

@Injectable()
export class Group1StudiesService {
  private readonly baseUrl =
    'https://srlgceodssgoifgosyoh.supabase.co/functions/v1';

  constructor(private readonly http: HttpService) {}

  /**
   * POST /generar_orden_medica
   * Envia multipart/form-data con:
   *  - payload (JSON stringify)
   *  - firma_medico (PNG obligatorio)
   */
  async generarOrdenMedica(payload: any, firmaMedico: Express.Multer.File) {
    const url = `${this.baseUrl}/generar_orden_medica`;

    const form = new FormData();
    form.append('payload', JSON.stringify(payload));
    form.append('firma_medico', firmaMedico.buffer, {
      filename: firmaMedico.originalname,
      contentType: firmaMedico.mimetype,
    });

    const { data } = await firstValueFrom(
      this.http.post(url, form, {
        headers: form.getHeaders(),
      }),
    );

    return data;
  }

  // Listados simples (según los nombres del PDF)
  async getSemenStudies() {
    const url = `${this.baseUrl}/estudios_semen`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data;
  }

  async getHormonalStudies() {
    const url = `${this.baseUrl}/estudios_hormonales`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data;
  }

  async getGynecologicalStudies() {
    const url = `${this.baseUrl}/estudios_ginecologicos`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data;
  }

  async getPreSurgicalOrder() {
    const url = `${this.baseUrl}/estudios_prequirurgicos`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data;
  }
}
