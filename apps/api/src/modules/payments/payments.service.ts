import { getHttpExceptionFromAxiosError } from '@common/utils/errors.utils';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ExternalMedicalInsuranceDetail,
  ExternalMedicalInsuranceResponse,
  ExternalPatientDebtResponse,
  PatientDebt,
} from '@repo/contracts';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, map, of } from 'rxjs';

@Injectable()
export class PaymentsService {
  private readonly apiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiUrl = this.configService.get<string>('PAYMENTS_API_URL');
  }

  async getExternalMedicalInsurances(): Promise<
    ExternalMedicalInsuranceDetail[]
  > {
    const url = `${this.apiUrl}/getObrasSociales`;

    const medicalInsurances = await firstValueFrom(
      this.httpService.get<ExternalMedicalInsuranceResponse>(url).pipe(
        map((res) => res.data),
        catchError((error: AxiosError) => {
          throw getHttpExceptionFromAxiosError(error);
        }),
      ),
    );

    return medicalInsurances.data;
  }

  async getOwnDebt(patientId: number): Promise<PatientDebt> {
    const url = `${this.apiUrl}/deuda-paciente`;

    const externalPatientDebtDetail = await firstValueFrom(
      this.httpService
        .post<ExternalPatientDebtResponse>(url, {
          id_paciente: patientId,
          numero_grupo: 7,
        })
        .pipe(
          map((res) => res.data),
          catchError((error: AxiosError) => {
            if (error.status === 404) {
              return of({
                id_paciente: patientId,
                numero_grupo: 7,
                deuda_total: 0,
              });
            } else {
              throw getHttpExceptionFromAxiosError(error);
            }
          }),
        ),
    );

    return {
      debt: externalPatientDebtDetail.deuda_total,
    };
  }
}
