import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class Group1StudiesService {
  private readonly baseUrl =
    'https://srlgceodssgoifgosyoh.supabase.co/functions/v1';

  constructor(private readonly http: HttpService) {}

  async getGynecologicalStudies() {
    const url = `${this.baseUrl}/estudio_ginecologico`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data;
  }

  async getHormonalStudies() {
    const url = `${this.baseUrl}/estudio_hormonales`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data;
  }

  async getPreSurgicalOrder() {
    const url = `${this.baseUrl}/get-orden-estudio-prequirurgico`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data;
  }

  async getSemenStudies() {
    const url = `${this.baseUrl}/estudio_semen`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data;
  }
}
