import {
  Injectable,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface AssignOvocytePayload {
  ovocito_id: string; // Ej: "101"
}

export interface DeallocateOvocytePayload {
  ovocito_id: string; // Ej: "101"
  id_tanque: number; // Ej: 1
  id_rack: number; // Ej: 181
}

export interface GetOvocytePositionPayload {
  ovocito_id: string; // Ej: "101"
}

@Injectable()
export class Group9OvocytesInventoryService {
  private readonly baseUrl =
    'https://ssewaxrnlmnyizqsbzxe.supabase.co/functions/v1';

  private readonly GROUP = '7';

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

  // ---------------------------------------------
  // 1) ASIGNAR OVOCITO
  // ---------------------------------------------
  async assignOvocyte(payload: AssignOvocytePayload): Promise<any> {
    return this.post('/assign-ovocyte', {
      nro_grupo: this.GROUP,
      ...payload,
    });
  }

  // ---------------------------------------------
  // 2) RETIRAR OVOCITO
  // ---------------------------------------------
  async deallocateOvocyte(payload: DeallocateOvocytePayload): Promise<any> {
    return this.post('/deallocate-ovocyte', {
      nro_grupo: this.GROUP,
      ...payload,
    });
  }

  // ---------------------------------------------
  // 3) CONSULTAR POSICIÓN
  // ---------------------------------------------
  async getOvocytePosition(payload: GetOvocytePositionPayload): Promise<any> {
    return this.post('/get-ovocito-posicion', {
      nro_grupo: this.GROUP,
      ...payload,
    });
  }
}
