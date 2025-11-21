import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class Group6ChatbotService {
  private readonly baseUrl =
    'https://talfxkyomlmfzbumscdm.supabase.co/functions/v1/fertility-chat';

  private readonly secret =
    process.env.CHATBOT_SECRET || 'DUMMY_CHATBOT_SECRET';

  constructor(private readonly http: HttpService) {}

  private headers() {
    return {
      Authorization: `Bearer ${this.secret}`,
      'Content-Type': 'application/json',
    };
  }

  preguntar(payload: {
    patientId: number;
    patientName: string;
    birthDate: string;
    gender: string;
    messages: any[];
  }) {
    return firstValueFrom(
      this.http.post(this.baseUrl, payload, { headers: this.headers() }),
    ).then((r) => r.data);
  }
}
