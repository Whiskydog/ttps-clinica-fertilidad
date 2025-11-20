import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';

@Injectable()
export class Group7GameteBankService {
  private readonly BASE_URL =
    'https://omtalaimckjolwtkgqjw.supabase.co/functions/v1';

  private readonly GROUP = 7;

  constructor(private readonly http: HttpService) {}

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE',
    body?: any,
  ): Promise<T> {
    const req$ = this.http
      .request<T>({
        url: `${this.BASE_URL}${endpoint}`,
        method,
        data: body,
        headers: { 'Content-Type': 'application/json' },
      })
      .pipe(
        catchError((err) => {
          throw new InternalServerErrorException(
            err.response?.data || 'Error Grupo 7 API',
          );
        }),
      );

    const { data } = await firstValueFrom(req$);
    return data;
  }

  // 1. Crear tanque
  createTank(payload: { type: 'esperma' | 'ovocito'; rack_count: number }) {
    return this.request('/tanques', 'POST', {
      group_number: this.GROUP,
      ...payload,
    });
  }

  // 2. Donar gameto
  donateGamete(payload: {
    type: 'esperma' | 'ovocito';
    phenotype: Record<string, any>;
  }) {
    return this.request('/gametos-donacion', 'POST', {
      group_number: this.GROUP,
      ...payload,
    });
  }

  // 3. Buscar compatible
  findCompatibleGamete(payload: {
    type: 'esperma' | 'ovocito';
    phenotype: Record<string, any>;
  }) {
    return this.request('/gametos-compatibilidad', 'POST', {
      group_number: this.GROUP,
      ...payload,
    });
  }

  // 4. Consultar almacenamiento
  getStorage(params: {
    page?: number;
    page_size?: number;
    type?: 'esperma' | 'ovocito';
  }) {
    const query = new URLSearchParams({
      group_number: String(this.GROUP),
      page: String(params.page ?? 1),
      page_size: String(params.page_size ?? 10),
      ...(params.type ? { type: params.type } : {}),
    });

    return this.request(`/almacenamiento?${query.toString()}`, 'GET');
  }

  // 5. Limpiar datos del grupo
  clearGroup() {
    return this.request(`/limpiar?group_number=${this.GROUP}`, 'DELETE');
  }

  // 6. Obtener ENUMS
  getEnums() {
    return this.request('/fenotipos', 'GET');
  }
}
