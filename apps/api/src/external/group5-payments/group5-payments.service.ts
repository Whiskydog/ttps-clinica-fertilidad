import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class Group5PaymentsService {
  private readonly baseUrl =
    'https://wxjtofmfoqtwqoslnljy.supabase.co/functions/v1';

  private readonly apiKey = process.env.PAGOS_API_KEY || 'DUMMY_PAGOS_TOKEN';

  constructor(private readonly http: HttpService) {}

  private headers() {
    return {
      apikey: this.apiKey,
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async createPayment(payload: {
    patientId: number;
    amount: number;
    description: string;
  }) {
    const url = `${this.baseUrl}/create-payment`;
    const { data } = await firstValueFrom(
      this.http.post(url, payload, { headers: this.headers() }),
    );
    return data;
  }

  async getPayments(patientId: number) {
    const url = `${this.baseUrl}/get-payments`;
    const { data } = await firstValueFrom(
      this.http.post(url, { patientId }, { headers: this.headers() }),
    );
    return data;
  }

  async getStatuses() {
    const url = `${this.baseUrl}/payment-status`;
    const { data } = await firstValueFrom(
      this.http.get(url, { headers: this.headers() }),
    );
    return data;
  }
}
