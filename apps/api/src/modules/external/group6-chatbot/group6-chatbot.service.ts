import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PatientsService } from '@users/services/patients.service';

@Injectable()
export class Group6ChatbotService {
  private readonly baseUrl =
    'https://talfxkyomlmfzbumscdm.supabase.co/functions/v1/fertility-chat';

  private readonly secret =
    process.env.CHATBOT_SECRET || 'DUMMY_CHATBOT_SECRET';

  constructor(
    private readonly http: HttpService,
    private readonly patientsService: PatientsService,
  ) { }

  private headers() {
    return {
      Authorization: `Bearer ${this.secret}`,
      'Content-Type': 'application/json',
    };
  }

  async preguntar(patientId: number, messages: any[]) {
    // 1. Fetch Patient Data from DB
    const patient = await this.patientsService.getPatientById(patientId);
    if (!patient) {
      throw new BadRequestException('Patient data not found');
    }

    // 2. Construct Payload expected by External API
    // Ensure dates are string formatted if needed, usually simple YYYY-MM-DD or standard ISO
    const payload = {
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      birthDate: patient.dateOfBirth, // getPatientById returns string formatted YYYY-MM-DD if it was Date instance
      gender: patient.biologicalSex || 'O', // Fallback if null, though contract says required
      messages: messages,
    };

    console.log('Sending payload to Chatbot:', JSON.stringify(payload, null, 2));

    // 3. Call External API
    try {
      const response = await firstValueFrom(
        this.http.post(this.baseUrl, payload, { headers: this.headers() }),
      );
      return response.data;
    } catch (error: any) {
      console.error('Chatbot API Error:', error?.response?.data || error);
      throw error;
    }
  }
}
