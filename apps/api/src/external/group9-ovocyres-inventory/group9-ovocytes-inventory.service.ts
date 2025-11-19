import {
  Injectable,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface AssignOvocytePayload {
  nro_grupo: string; // Ej: "1"
  ovocito_id: string; // Ej: "101"
}

export interface DeallocateOvocytePayload {
  nro_grupo: string; // Ej: "1"
  ovocito_id: string; // Ej: "101"
  id_tanque: number; // Ej: 1
  id_rack: number; // Ej: 181
}

export interface GetOvocytePositionPayload {
  nro_grupo: string; // Ej: "1"
  ovocito_id: string; // Ej: "101"
}

@Injectable()
export class OvocytesInventoryApiService {
  private readonly baseUrl =
    'https://ssewaxrnlmnyizqsbzxe.supabase.co/functions/v1';

  constructor(private readonly http: HttpService) {}

  private async post(path: string, body: any): Promise<any> {
    const url = `${this.baseUrl}${path}`;
    try {
      const resp = await firstValueFrom(
        this.http.post(url, body, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
      return resp.data;
    } catch (error: any) {
      if (error.response) {
        throw new HttpException(
          error.response.data ?? 'Error en módulo de ovocitos (grupo 9)',
          error.response.status ?? 502,
        );
      }
      throw new InternalServerErrorException(
        'Error al comunicarse con el módulo de ovocitos (grupo 9)',
      );
    }
  }

  async assignOvocyte(payload: AssignOvocytePayload): Promise<any> {
    return this.post('/assign-ovocyte', payload);
  }

  async deallocateOvocyte(payload: DeallocateOvocytePayload): Promise<any> {
    return this.post('/deallocate-ovocyte', payload);
  }

  async getOvocytePosition(payload: GetOvocytePositionPayload): Promise<any> {
    return this.post('/get-ovocito-posicion', payload);
  }
}
