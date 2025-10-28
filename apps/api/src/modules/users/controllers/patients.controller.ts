import { Body, Controller, Get, Post } from '@nestjs/common';
import { PatientsService } from '@users/services/patients.service';
import { PatientCreateDto, PatientResponseDto } from '@users/dto';
import { Patient } from '@users/entities/patient.entity';
import { ZodSerializerDto } from 'nestjs-zod';
import { Public } from '@auth/decorators/public.decorator';

@Controller('patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Post()
  @Public()
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
