import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class Group4SemenCryoService {
  private readonly baseUrl =
    'https://hrqzwqkhpxvoogskrfue.supabase.co/functions/v1';

  constructor(private readonly http: HttpService) {}

  async listarMuestras() {
    const url = `${this.baseUrl}/muestras`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data;
  }

  async buscarPorDni(dni: string) {
    const url = `${this.baseUrl}/buscar_muestras`;
    const { data } = await firstValueFrom(this.http.post(url, { dni }));
    return data;
  }

  async registrarDisposicion(payload: {
    muestra_id: number;
    nueva_disposicion: string;
  }) {
    const url = `${this.baseUrl}/registrar_disposicion`;
    const { data } = await firstValueFrom(this.http.post(url, payload));
    return data;
  }
}
