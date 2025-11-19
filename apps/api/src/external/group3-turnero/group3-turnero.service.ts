import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class Group3TurneroService {
  private readonly baseUrl =
    'https://lcmnbtrjwctfdfmbfkqs.supabase.co/functions/v1';

  private readonly apiKey =
    process.env.TURNERO_API_KEY || 'DUMMY_TURNERO_TOKEN';

  constructor(private readonly http: HttpService) {}

  private buildHeaders() {
    return {
      apikey: this.apiKey,
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async getAvailableSlots(doctorId: number, date: string) {
    const url = `${this.baseUrl}/available_slots`;
    const body = { doctorId, date };

    const { data } = await firstValueFrom(
      this.http.post(url, body, { headers: this.buildHeaders() }),
    );

    return data;
  }

  async reserveTurno(payload: {
    doctorId: number;
    patientId: number;
    date: string;
    time: string;
  }) {
    const url = `${this.baseUrl}/reserve_turno`;

    const { data } = await firstValueFrom(
      this.http.post(url, payload, { headers: this.buildHeaders() }),
    );

    return data;
  }
}
