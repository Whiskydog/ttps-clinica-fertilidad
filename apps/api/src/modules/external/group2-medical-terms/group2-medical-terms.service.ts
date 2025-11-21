import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class Group2MedicalTermsService {
  private readonly baseUrl =
    'https://stqzgokdxgpqjinrmpfu.supabase.co/functions/v1';

  constructor(private readonly http: HttpService) {}

  async searchTerms(q: string, page = 1, limit = 10) {
    const url = `${this.baseUrl}/search_terminos?q=${q}&page=${page}&limit=${limit}`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data;
  }
}
