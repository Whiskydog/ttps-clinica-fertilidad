import {
  Injectable,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface SendAvisoEmailPayload {
  group: number; 
  toEmails: string[]; // destinatarios
  subject: string; // asunto
  htmlBody: string; // cuerpo HTML
}

@Injectable()
export class AvisosApiService {
  private readonly baseUrl =
    'https://mvvuegssraetbyzeifov.supabase.co/functions/v1';

  constructor(private readonly http: HttpService) {}

  async sendEmail(payload: SendAvisoEmailPayload): Promise<any> {
    const url = `${this.baseUrl}/send_email_v2`;

    try {
      const resp = await firstValueFrom(
        this.http.post(url, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
      return resp.data;
    } catch (error: any) {
      if (error.response) {
        throw new HttpException(
          error.response.data ?? 'Error en módulo de avisos',
          error.response.status ?? 502,
        );
      }
      throw new InternalServerErrorException(
        'Error al comunicarse con el módulo de avisos (grupo 8)',
      );
    }
  }
}
