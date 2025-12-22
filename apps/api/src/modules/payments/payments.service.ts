import { getHttpExceptionFromAxiosError } from '@common/utils/errors.utils';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExternalPatientDebtResponse, PatientDebt } from '@repo/contracts';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { Group5PaymentsService } from '../external/group5-payments/group5-payments.service';

@Injectable()
export class PaymentsService {
  private readonly apiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly group5PaymentsService: Group5PaymentsService,
  ) {
    this.apiUrl = this.configService.get<string>('PAYMENTS_API_URL');
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

  getObrasSociales() {
    return this.group5PaymentsService.getObrasSociales();
  }

  // Helper to get paginated payments or just all payments
  // The external API has query params? No, only 'group' body param for list.
  // We need to fetch payments for our group (7).
  async getGroupPayments() {
    return this.group5PaymentsService.getPagosGrupo(7);
  }

  async registerPayment(payload: {
    id_grupo: number;
    id_pago: number;
    obra_social_pagada: boolean;
    paciente_pagado: boolean;
  }) {
    return this.group5PaymentsService.registrarPago(payload);
  }
}
