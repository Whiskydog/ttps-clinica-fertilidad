import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';

@Injectable()
export class GametesApiService {
  private readonly BASE_URL =
    'https://omtalaimckjolwtkgqjw.supabase.co/functions/v1';
  private readonly GROUP_NUMBER = 7; // Fijo para el grupo 7

  constructor(private readonly http: HttpService) {}

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE',
    body?: any,
  ): Promise<T> {
    // eslint-disable-next-line no-useless-catch
    try {
      const response$ = this.http
        .request<T>({
          url: `${this.BASE_URL}${endpoint}`,
          method,
          data: body,
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .pipe(
          catchError((err) => {
            throw new InternalServerErrorException(
              err?.response?.data || 'Error en API externa (Grupo 7)',
            );
          }),
        );

      const { data } = await firstValueFrom(response$);
      return data;
    } catch (err) {
      throw err;
    }
  }

  createTank(payload: { type: string; rack_count: number }) {
    return this.request('/tanques', 'POST', {
      group_number: this.GROUP_NUMBER,
      ...payload,
    });
  }

  donateGamete(payload: {
    donor_id: number;
    fenotype: Record<string, any>;
    gamete_type: string; // esperma / ovocito
  }) {
    return this.request('/gametos-donacion', 'POST', {
      group_number: this.GROUP_NUMBER,
      ...payload,
    });
  }


  findCompatibleGamete(payload: {
    patient_id: number;
    required_traits: Record<string, any>;
  }) {
    return this.request('/gametos-compatibilidad', 'POST', {
      group_number: this.GROUP_NUMBER,
      ...payload,
    });
  }

  getStorage() {
    return this.request(
      `/almacenamiento?group_number=${this.GROUP_NUMBER}`,
      'GET',
    );
  }

  clearGroup() {
    return this.request('/limpiar', 'DELETE', {
      group_number: this.GROUP_NUMBER,
    });
  }

  getEnums() {
    return this.request(
      `/fenotipos?group_number=${this.GROUP_NUMBER}`,
      'GET',
    );
  }
}
