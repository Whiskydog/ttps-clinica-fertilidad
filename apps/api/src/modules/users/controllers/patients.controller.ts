import { EnvelopeMessage } from '@common/decorators/envelope-message.decorator';
import { Public } from '@modules/auth/decorators/public.decorator';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { PatientCreateDto, PatientResponseDto } from '@users/dto';
import { Patient } from '@users/entities/patient.entity';
import { PatientsService } from '@users/services/patients.service';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Public()
  @Post()
  @EnvelopeMessage('Paciente registrado exitosamente')
  @ZodSerializerDto(PatientResponseDto)
  async createPatient(@Body() dto: PatientCreateDto): Promise<Patient> {
    return this.patientsService.createPatient(dto);
  }

  @Get()
  @ZodSerializerDto([PatientResponseDto])
  async getPatients(): Promise<Patient[]> {
    return this.patientsService.getPatients();
  }
}
