import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class Group6ChatbotService {
  private readonly baseUrl =
    'https://fbtoxxvhjtzdklstpkgo.supabase.co/functions/v1';

  constructor(private readonly http: HttpService) {}

  async ask(question: string) {
    const url = `${this.baseUrl}/chatbot`;
    const { data } = await firstValueFrom(this.http.post(url, { question }));
    return data;
  }
}
