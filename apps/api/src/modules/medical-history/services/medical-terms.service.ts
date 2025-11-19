import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

interface MedicalTermRow {
  descripcion: string;
}

interface MedicalTermsApiResponse {
  rows: MedicalTermRow[];
  total_count: number;
}

@Injectable()
export class MedicalTermsService {
  private readonly baseUrl =
    'https://stqzgokdxgpqjinrmpfu.supabase.co/functions/v1/search_terminos';

  constructor(private readonly httpService: HttpService) {}

  async searchTerms(
    q: string,
    page = 1,
    limit = 10,
  ): Promise<MedicalTermsApiResponse> {
    if (!q || q.trim().length < 3) {
      return { rows: [], total_count: 0 };
    }

    try {
      const response$ = this.httpService.get<MedicalTermsApiResponse>(
        this.baseUrl,
        { params: { q, page, limit } },
      );
      const { data } = await firstValueFrom(response$);
      return data;
    } catch {
      throw new InternalServerErrorException(
        'Error al consultar el módulo de términos médicos',
      );
    }
  }
}
