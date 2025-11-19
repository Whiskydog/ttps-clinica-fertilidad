import {
  Injectable,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface TelegramBotSendPayload {
  text: string; // mensaje a enviar al grupo de Telegram
}

@Injectable()
export class TelegramBotApiService {
  private readonly url =
    'https://dryvmlqcysuushbmofqg.supabase.co/functions/v1/dynamic-responder/send';

  constructor(private readonly http: HttpService) {}

  async sendAlert(payload: TelegramBotSendPayload): Promise<any> {
    try {
      const resp = await firstValueFrom(
        this.http.post(this.url, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
      return resp.data;
    } catch (error: any) {
      if (error.response) {
        throw new HttpException(
          (typeof error.response.data === 'string' || typeof error.response.data === 'object'
            ? error.response.data
            : 'Error en módulo Bot Telegram (grupo 10)'),
          error.response.status ?? 502,
        );
      }
      throw new InternalServerErrorException(
        'Error al comunicarse con el módulo Bot Telegram ',
      );
    }
  }
}
