import { getHttpExceptionFromAxiosError } from '@common/utils/errors.utils';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ExternalMedicalInsuranceDetail,
  ExternalMedicalInsuranceResponse,
  ExternalPatientDebtResponse,
  ExternalPaymentOrderResponse,
  PatientDebt,
} from '@repo/contracts';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { Repository } from 'typeorm';
import { PaymentOrder } from './entities/payment-order.entity';
import { Group5PaymentsService } from '../external/group5-payments/group5-payments.service';

@Injectable()
export class PaymentsService {
  private readonly apiUrl: string;

  constructor(
    @InjectRepository(PaymentOrder)
    private readonly paymentOrdersRepository: Repository<PaymentOrder>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly group5PaymentsService: Group5PaymentsService,
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

  async registerPaymentOrder(
    treatmentId: number,
    patientId: number,
    medicalInsuranceExternalId: number,
  ): Promise<PaymentOrder> {
    const url = `${this.apiUrl}/registrar-orden-pago`;

    const response = await firstValueFrom(
      this.httpService
        .post<ExternalPaymentOrderResponse>(url, {
          grupo: 7,
          id_paciente: patientId,
          id_obra: medicalInsuranceExternalId,
          monto: 450000,
        })
        .pipe(
          map((res) => res.data),
          catchError((error: AxiosError) => {
            throw getHttpExceptionFromAxiosError(error);
          }),
        ),
    );

    const paymentOrder = this.paymentOrdersRepository.create({
      externalId: response.pago.id,
      treatment: { id: treatmentId },
      patient: { id: patientId },
      medicalInsurance: { externalId: medicalInsuranceExternalId },
      insuranceDue: response.pago.monto_obra_social,
      patientDue: response.pago.monto_paciente,
    });

    return await this.paymentOrdersRepository.save(paymentOrder);
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
