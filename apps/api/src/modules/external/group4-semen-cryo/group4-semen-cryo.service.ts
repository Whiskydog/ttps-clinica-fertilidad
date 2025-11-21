import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class Group4SemenCryoService {
  private readonly baseUrl =
    'https://bmcgxbtbcmlzoetyqajn.supabase.co/functions/v1';

  private readonly token = process.env.SEMEN_CRYO_TOKEN || 'token-grupo-4';

  constructor(private readonly http: HttpService) {}

  private headers() {
    return {
      token: this.token,
      'Content-Type': 'application/json',
    };
  }

  async crearTanque(body: { group_id: number }) {
    const url = `${this.baseUrl}/crear-tanque`;
    const { data } = await firstValueFrom(
      this.http.post(url, body, { headers: this.headers() }),
    );
    return data;
  }

  async congelar(body: { group_id: number; dni: string }) {
    const url = `${this.baseUrl}/congelar-semen`;
    const { data } = await firstValueFrom(
      this.http.post(url, body, { headers: this.headers() }),
    );
    return data;
  }

  async descongelar(body: { group_id: number; dni: string }) {
    const url = `${this.baseUrl}/descongelar-semen`;
    const { data } = await firstValueFrom(
      this.http.post(url, body, { headers: this.headers() }),
    );
    return data;
  }

  async dniTieneMuestra(body: { group_id: number; dni: string }) {
    const url = `${this.baseUrl}/dni-tiene-muestra`;
    const { data } = await firstValueFrom(
      this.http.post(url, body, { headers: this.headers() }),
    );
    return data;
  }
}
